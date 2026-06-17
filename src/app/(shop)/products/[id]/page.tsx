import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDiscountRate } from "@/lib/member";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, payload] = await Promise.all([
    prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    }),
    getCurrentUser(),
  ]);

  if (!product || product.status === "INACTIVE") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-2xl text-gray-400">商品不存在或已下架</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  let userDiscountRate = 1.0;
  let userLevel = "NONE";
  if (payload) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { memberLevel: true },
    });
    if (user) {
      userLevel = user.memberLevel;
      userDiscountRate = getDiscountRate(user.memberLevel);
    }
  }

  const memberPrice = Number(product.price) * userDiscountRate;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* 商品图片 */}
        <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <span className="text-6xl text-gray-300">📦</span>
          )}
        </div>

        {/* 商品信息 */}
        <div>
          <p className="mb-2 text-sm text-gray-400">
            <Link href="/" className="hover:underline">首页</Link>
            {" / "}
            <Link href={`/search?category=${product.category.slug}`} className="hover:underline">
              {product.category.name}
            </Link>
          </p>
          <h1 className="mb-4 text-2xl font-bold">{product.name}</h1>

          {/* 价格 */}
          <div className="mb-4">
            {userDiscountRate < 1 ? (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ¥{Number(product.price).toFixed(2)}
                </span>
                <span className="ml-3 text-3xl font-bold text-red-500">
                  ¥{memberPrice.toFixed(2)}
                </span>
                <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                  {Math.round(userDiscountRate * 10)}折
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-red-500">
                ¥{Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <p className="mb-6 text-gray-600">{product.description}</p>

          <div className="mb-6 space-y-2 text-sm text-gray-500">
            <p>库存: {product.stock > 0 ? product.stock : "已售罄"}</p>
            <p>分类: {product.category.name}</p>
          </div>

          {product.stock > 0 && payload && (
            <AddToCartButton productId={product.id} />
          )}
        </div>
      </div>
    </div>
  );
}
