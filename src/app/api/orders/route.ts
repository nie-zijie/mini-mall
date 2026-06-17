import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parsePaginationParams, buildPaginatedResponse, apiError, apiSuccess } from "@/lib/utils";
import { calcMemberLevel, getDiscountRate } from "@/lib/member";

// GET - 订单列表（当前用户 / 管理员查看全部）
export async function GET(request: Request) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePaginationParams(searchParams);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    // 非管理员只能看自己的订单
    if (payload.role !== "ADMIN") {
      where.userId = payload.userId;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, username: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess(buildPaginatedResponse(items, total, { page, pageSize }));
  } catch (error) {
    console.error("Get orders error:", error);
    return apiError("获取订单列表失败", 500);
  }
}

// POST - 创建订单（从购物车下单）
export async function POST() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    // 使用事务保证数据一致性
    const order = await prisma.$transaction(async (tx) => {
      // 1. 获取购物车
      const cartItems = await tx.cartItem.findMany({
        where: { userId: payload.userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error("购物车为空");
      }

      // 2. 获取用户信息（会员等级）
      const user = await tx.user.findUnique({
        where: { id: payload.userId },
        select: { memberLevel: true },
      });

      const discountRate = getDiscountRate(user!.memberLevel);

      // 3. 计算金额 & 验证库存
      let subtotal = 0;
      for (const item of cartItems) {
        if (item.product.status === "INACTIVE") {
          throw new Error(`商品「${item.product.name}」已下架`);
        }
        if (item.quantity > item.product.stock) {
          throw new Error(`商品「${item.product.name}」库存不足`);
        }
        subtotal += Number(item.product.price) * item.quantity;
      }

      const discount = subtotal * (1 - discountRate);
      const total = subtotal - discount;

      // 4. 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 5. 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: payload.userId,
          subtotal,
          discount,
          total,
          discountRate,
          memberLevel: user!.memberLevel,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // 6. 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: payload.userId },
      });

      return newOrder;
    });

    return apiSuccess(order, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "下单失败";
    return apiError(message, 500);
  }
}
