import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getCurrentUser();

  if (!payload || payload.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="w-56 border-r bg-white p-6">
        <Link href="/admin" className="mb-8 block text-lg font-bold text-primary">
          Mini Mall 后台
        </Link>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            仪表盘
          </Link>
          <Link
            href="/admin/products"
            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            商品管理
          </Link>
          <Link
            href="/admin/categories"
            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            分类管理
          </Link>
          <Link
            href="/admin/orders"
            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            订单管理
          </Link>
          <Link
            href="/admin/users"
            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            用户管理
          </Link>
        </nav>
        <div className="mt-8 border-t pt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-primary">
            &larr; 返回前台
          </Link>
        </div>
      </aside>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {children}
      </div>
    </div>
  );
}
