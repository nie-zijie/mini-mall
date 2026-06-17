import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  quantity: z.number().int().min(0),
});

// PUT - 更新购物车商品数量
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

    const { quantity } = parsed.data;

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: parseInt(id) } });
      return apiSuccess({ message: "已移除" });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { product: true },
    });

    if (!item) {
      return apiError("购物车项不存在", 404);
    }

    if (quantity > item.product.stock) {
      return apiError("库存不足");
    }

    const updated = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity },
      include: { product: true },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Update cart error:", error);
    return apiError("更新购物车失败", 500);
  }
}

// DELETE - 移除购物车商品
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return apiError("请先登录", 401);
    }

    const { id } = await params;
    await prisma.cartItem.delete({ where: { id: parseInt(id) } });

    return apiSuccess({ message: "已移除" });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return apiError("移除失败", 500);
  }
}
