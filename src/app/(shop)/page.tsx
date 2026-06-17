import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  // 获取分类和商品
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero / Search */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">欢迎来到 Mini Mall</h1>
        <p className="mb-6 text-gray-500">精选好物，尽在 Mini Mall</p>
        <div className="mx-auto flex max-w-md gap-2">
          <form action="/search" method="GET" className="flex w-full gap-2">
            <input
              name="q"
              type="text"
              placeholder="搜索商品..."
              className="flex-1 rounded-lg border px-4 py-2 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark"
            >
              搜索
            </button>
          </form>
        </div>
      </div>

      {/* 分类导航 */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-full bg-gray-100 px-4 py-1.5 text-sm hover:bg-primary hover:text-white"
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}`}
              className="rounded-full bg-gray-100 px-4 py-1.5 text-sm hover:bg-primary hover:text-white"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* 商品网格 */}
      {products.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-lg">暂无商品</p>
          <p className="mt-2">请先在后台添加商品和分类</p>
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
