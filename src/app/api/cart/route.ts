import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

// GET - 获取当前用户购物车
export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: payload.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return apiSuccess(cartItems);
  } catch (error) {
    console.error("Get cart error:", error);
    return apiError("获取购物车失败", 500);
  }
}

const addSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1).default(1),
});

// POST - 添加到购物车
export async function POST(request: Request) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    const body = await request.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { productId, quantity } = parsed.data;

    // 检查商品是否存在且有库存
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.status === "INACTIVE") {
      return apiError("商品不存在或已下架");
    }
    if (product.stock < quantity) {
      return apiError("库存不足");
    }

    // 如果购物车已有该商品，则叠加数量
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    });

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > product.stock) {
        return apiError("库存不足");
      }
      const item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
      return apiSuccess(item);
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: payload.userId,
        productId,
        quantity,
      },
      include: { product: true },
    });

    return apiSuccess(item, 201);
  } catch (error) {
    console.error("Add to cart error:", error);
    return apiError("添加到购物车失败", 500);
  }
}
