import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

// GET - 商品详情
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return apiError("商品不存在", 404);
    }

    return apiSuccess(product);
  } catch (error) {
    console.error("Get product error:", error);
    return apiError("获取商品详情失败", 500);
  }
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  image: z.string().optional(),
  categoryId: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// PUT - 更新商品
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload || payload.role !== "ADMIN") {
      return apiError("无权限", 403);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: parsed.data,
      include: { category: true },
    });

    return apiSuccess(product);
  } catch (error) {
    console.error("Update product error:", error);
    return apiError("更新商品失败", 500);
  }
}

// DELETE - 删除商品
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload || payload.role !== "ADMIN") {
      return apiError("无权限", 403);
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return apiSuccess({ message: "删除成功" });
  } catch (error) {
    console.error("Delete product error:", error);
    return apiError("删除商品失败", 500);
  }
}
