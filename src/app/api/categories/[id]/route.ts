import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

// PUT - 更新分类
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

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: parsed.data,
    });

    return apiSuccess(category);
  } catch (error) {
    console.error("Update category error:", error);
    return apiError("更新分类失败", 500);
  }
}

// DELETE - 删除分类
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
    const categoryId = parseInt(id);

    // 检查是否有商品关联
    const productCount = await prisma.product.count({
      where: { categoryId },
    });
    if (productCount > 0) {
      return apiError("该分类下还有商品，无法删除");
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return apiSuccess({ message: "删除成功" });
  } catch (error) {
    console.error("Delete category error:", error);
    return apiError("删除分类失败", 500);
  }
}
