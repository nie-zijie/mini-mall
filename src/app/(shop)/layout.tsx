import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MemberLevel, MEMBER_LABELS, MEMBER_DISCOUNTS } from "@/lib/member";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getCurrentUser();

  let user = null;
  if (payload) {
    user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, memberLevel: true, totalSpent: true },
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold text-primary">
            Mini Mall
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.memberLevel !== "NONE" && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {MEMBER_LABELS[user.memberLevel as MemberLevel]}
                  </span>
                )}
                <Link href="/profile" className="text-sm text-gray-600 hover:text-primary">
                  {user.username}
                </Link>
                <Link href="/cart" className="text-sm text-gray-600 hover:text-primary">
                  购物车
                </Link>
                <Link href="/orders" className="text-sm text-gray-600 hover:text-primary">
                  我的订单
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-primary">
                  登录
                </Link>
                <Link href="/register" className="text-sm text-gray-600 hover:text-primary">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Mini Mall. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
