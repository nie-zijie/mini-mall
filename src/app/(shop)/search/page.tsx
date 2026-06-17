import { prisma } from "@/lib/prisma";
import { parsePaginationParams, buildPaginatedResponse, apiSuccess } from "@/lib/utils";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });

  // 构建搜索条件和分类筛选
  const q = params.q || "";
  const categorySlug = params.category || "";

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (q) {
    where.name = { contains: q };
  }

  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (cat) {
      where.categoryId = cat.id;
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const currentCategory = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 搜索栏 */}
      <div className="mb-6">
        <form action="/search" method="GET" className="mx-auto flex max-w-md gap-2">
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="搜索商品..."
            className="flex-1 rounded-lg border px-4 py-2 focus:border-primary focus:outline-none"
          />
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 分类导航 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={q ? `/search?q=${q}` : "/"}
          className={`rounded-full px-4 py-1.5 text-sm ${
            !categorySlug ? "bg-primary text-white" : "bg-gray-100 hover:bg-primary hover:text-white"
          }`}
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={q ? `/search?q=${q}&category=${cat.slug}` : `/search?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              categorySlug === cat.slug
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-primary hover:text-white"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 结果标题 */}
      {(q || currentCategory) && (
        <p className="mb-4 text-sm text-gray-500">
          {q && currentCategory
            ? `「${q}」在「${currentCategory.name}」中的搜索结果`
            : q
            ? `「${q}」的搜索结果`
            : currentCategory
            ? `分类：${currentCategory.name}`
            : ""}
          ，共 {products.length} 件商品
        </p>
      )}

      {/* 商品网格 */}
      {products.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p>没有找到相关商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-300">📦</span>
                )}
              </div>
              <h3 className="mb-1 truncate font-medium group-hover:text-primary">
                {product.name}
              </h3>
              <p className="text-xs text-gray-400">{product.category.name}</p>
              <p className="mt-2 text-lg font-bold text-primary">
                ¥{Number(product.price).toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
