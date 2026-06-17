import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, userCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.category.count(),
  ]);

  // 会员统计
  const memberStats = await prisma.user.groupBy({
    by: ["memberLevel"],
    _count: true,
  });

  const memberMap: Record<string, number> = {};
  memberStats.forEach((s) => {
    memberMap[s.memberLevel] = s._count;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-400">商品总数</p>
          <p className="text-3xl font-bold">{productCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-400">订单总数</p>
          <p className="text-3xl font-bold">{orderCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-400">用户总数</p>
          <p className="text-3xl font-bold">{userCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-400">分类总数</p>
          <p className="text-3xl font-bold">{categoryCount}</p>
        </div>
      </div>

      {/* 会员统计 */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">会员概览</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-400">普通用户</p>
            <p className="text-2xl font-bold">{memberMap["NONE"] || 0}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-center">
            <p className="text-sm text-amber-600">心悦Lv1 (9折)</p>
            <p className="text-2xl font-bold text-amber-700">
              {memberMap["XINYUE_1"] || 0}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-4 text-center">
            <p className="text-sm text-orange-600">心悦Lv2 (8折)</p>
            <p className="text-2xl font-bold text-orange-700">
              {memberMap["XINYUE_2"] || 0}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">心悦Lv3 (7折)</p>
            <p className="text-2xl font-bold text-red-700">
              {memberMap["XINYUE_3"] || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
