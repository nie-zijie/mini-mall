import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

// GET - 获取全部分类
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    return apiSuccess(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return apiError("获取分类失败", 500);
  }
}

const createSchema = z.object({
  name: z.string().min(1, "分类名不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
});

// POST - 新增分类（管理员）
export async function POST(request: Request) {
  try {
    const payload = await getCurrentUser();
    if (!payload || payload.role !== "ADMIN") {
      return apiError("无权限", 403);
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: parsed.data.name },
          { slug: parsed.data.slug },
        ],
      },
    });

    if (existing) {
      return apiError("分类名或 Slug 已存在");
    }

    const category = await prisma.category.create({
      data: parsed.data,
    });

    return apiSuccess(category, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return apiError("创建分类失败", 500);
  }
}
