"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLevel, MEMBER_LABELS, getDiscountRate, getNextLevelProgress } from "@/lib/member";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    role: string;
    memberLevel: string;
    totalSpent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    document.cookie =
      "mini-mall-token=; path=/; max-age=0";
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-400">请先登录</p>
      </div>
    );
  }

  const memberLevel = user.memberLevel as MemberLevel;
  const discountRate = getDiscountRate(memberLevel);
  const progress = getNextLevelProgress(Number(user.totalSpent));
  const levelLabel = MEMBER_LABELS[memberLevel];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">个人中心</h1>

      {/* 会员卡片 */}
      <div className="mb-6 rounded-xl border bg-gradient-to-r from-amber-50 to-white p-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            {levelLabel}
          </span>
          {discountRate < 1 && (
            <span className="text-sm text-red-500">
              享{(discountRate * 10).toFixed(0)}折优惠
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          累计消费: ¥{Number(user.totalSpent).toFixed(2)}
        </p>

        {progress && (
          <div className="mt-4">
            <p className="mb-1 text-sm text-gray-500">
              距{MEMBER_LABELS[progress.nextLevel]}还需消费 ¥{progress.need.toFixed(2)}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (Number(user.totalSpent) /
                      (Number(user.totalSpent) + progress.need)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">基本信息</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-400">用户名：</span>
            {user.username}
          </p>
          <p>
            <span className="text-gray-400">邮箱：</span>
            {user.email}
          </p>
          <p>
            <span className="text-gray-400">角色：</span>
            {user.role === "ADMIN" ? "管理员" : "普通用户"}
          </p>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="space-y-3">
        <Link
          href="/orders"
          className="block rounded-lg border bg-white p-4 hover:border-primary"
        >
          我的订单 →
        </Link>
        <Link
          href="/cart"
          className="block rounded-lg border bg-white p-4 hover:border-primary"
        >
          购物车 →
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full rounded-lg border border-red-300 py-3 text-sm text-red-500 hover:bg-red-50"
      >
        退出登录
      </button>
    </div>
  );
}
