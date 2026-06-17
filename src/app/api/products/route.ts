import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parsePaginationParams, buildPaginatedResponse, apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

// GET - 商品列表（支持搜索、分类筛选、排序、分页）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePaginationParams(searchParams);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const sort = searchParams.get("sort") || "createdAt_desc";

    const where: Record<string, unknown> = { status: "ACTIVE" };

    if (search) {
      where.name = { contains: search };
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // 排序
    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess(buildPaginatedResponse(items, total, { page, pageSize }));
  } catch (error) {
    console.error("Get products error:", error);
    return apiError("获取商品列表失败", 500);
  }
}

const createSchema = z.object({
  name: z.string().min(1, "商品名不能为空"),
  description: z.string().optional(),
  price: z.number().positive("价格必须大于 0"),
  stock: z.number().int().min(0, "库存不能为负").default(0),
  image: z.string().optional(),
  categoryId: z.number().int(),
});

// POST - 新增商品（管理员）
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

    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: true },
    });

    return apiSuccess(product, 201);
  } catch (error) {
    console.error("Create product error:", error);
    return apiError("创建商品失败", 500);
  }
}
