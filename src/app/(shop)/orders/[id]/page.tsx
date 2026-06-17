"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_MAP: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-400">
        订单不存在
      </div>
    );
  }

  const items = (order.items as Array<Record<string, unknown>>) || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/orders" className="text-sm text-primary hover:underline">
        &larr; 返回订单列表
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">
        订单详情 #{(order.id as number)}
      </h1>

      <div className="rounded-lg border bg-white p-6">
        {/* 状态 */}
        <div className="mb-4">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              order.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : order.status === "PAID"
                ? "bg-blue-100 text-blue-700"
                : order.status === "CANCELLED"
                ? "bg-gray-100 text-gray-500"
                : "bg-green-100 text-green-700"
            }`}
          >
            {STATUS_MAP[order.status as string]}
          </span>
          <span className="ml-4 text-sm text-gray-400">
            {new Date(order.createdAt as string).toLocaleString("zh-CN")}
          </span>
        </div>

        {/* 商品列表 */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id as number} className="flex justify-between border-b pb-3">
              <div>
                <p className="font-medium">{item.productName as string}</p>
                <p className="text-sm text-gray-400">
                  单价 ¥{Number(item.price).toFixed(2)} × {item.quantity as number}
                </p>
              </div>
              <span className="font-medium">
                ¥{(Number(item.price) * (item.quantity as number)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* 金额 */}
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>原价小计</span>
            <span>¥{Number(order.subtotal).toFixed(2)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-red-500">
              <span>
                会员折扣 (
                {(Number(order.discountRate) * 10).toFixed(0)}
                折)
              </span>
              <span>-¥{Number(order.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>实付</span>
            <span className="text-red-500">¥{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
