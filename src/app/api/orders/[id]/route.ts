import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { calcMemberLevel } from "@/lib/member";
import { z } from "zod";

// GET - 订单详情
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, username: true, email: true } },
      },
    });

    if (!order) {
      return apiError("订单不存在", 404);
    }

    // 非管理员只能看自己的
    if (payload.role !== "ADMIN" && order.userId !== payload.userId) {
      return apiError("无权限", 403);
    }

    return apiSuccess(order);
  } catch (error) {
    console.error("Get order error:", error);
    return apiError("获取订单详情失败", 500);
  }
}

const updateSchema = z.object({
  status: z.enum(["PAID", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

// PUT - 更新订单状态
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return apiError("订单不存在", 404);
    }

    // 普通用户只能取消自己的订单
    if (payload.role !== "ADMIN") {
      if (order.userId !== payload.userId) {
        return apiError("无权限", 403);
      }
      if (parsed.data.status !== "CANCELLED") {
        return apiError("无权限", 403);
      }
      if (order.status !== "PENDING") {
        return apiError("只能取消待支付订单");
      }
    }

    // 支付时：累加消费金额 + 重算等级
    let levelUp: { from: string; to: string } | null = null;

    if (parsed.data.status === "PAID" && order.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: parseInt(id) },
          data: { status: "PAID" },
        });

        const user = await tx.user.update({
          where: { id: order.userId },
          data: { totalSpent: { increment: order.total } },
          select: { totalSpent: true, memberLevel: true },
        });

        const newLevel = calcMemberLevel(Number(user.totalSpent));
        if (newLevel !== user.memberLevel) {
          await tx.user.update({
            where: { id: order.userId },
            data: { memberLevel: newLevel },
          });
          levelUp = { from: user.memberLevel, to: newLevel };
        }
      });
    } else {
      await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status: parsed.data.status },
      });
    }

    const result: Record<string, unknown> = { message: "状态更新成功" };
    if (levelUp) {
      result.levelUp = levelUp;
    }

    return apiSuccess(result);
  } catch (error) {
    console.error("Update order error:", error);
    return apiError("更新订单失败", 500);
  }
}
