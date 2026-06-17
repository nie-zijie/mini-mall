"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: number;
  productName?: string;
  product: { id: number; name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  subtotal: number;
  discount: number;
  total: number;
  discountRate: number;
  memberLevel: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_MAP: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.items || []);
      }
    } catch {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePay = async (id: number) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    const data = await res.json();

    if (res.ok) {
      if (data.levelUp) {
        alert(`恭喜！会员等级提升：${data.levelUp.from} → ${data.levelUp.to}`);
      }
      fetchOrders();
    } else {
      alert(data.error || "支付失败");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("确定取消该订单？")) return;
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (res.ok) {
      fetchOrders();
    } else {
      const data = await res.json();
      alert(data.error || "取消失败");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">我的订单</h1>

      {orders.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-lg">暂无订单</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            去购物
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  订单号：#{order.id} |{" "}
                  {new Date(order.createdAt).toLocaleString("zh-CN")}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "PAID"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "CANCELLED"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {STATUS_MAP[order.status]}
                </span>
              </div>

              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.productName || item.product?.name} × {item.quantity}</span>
                    <span>¥{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t pt-3">
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>会员折扣</span>
                    <span>-¥{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>实付</span>
                  <span className="text-red-500">
                    ¥{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50"
                >
                  详情
                </Link>
                {order.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handlePay(order.id)}
                      className="rounded bg-primary px-4 py-1.5 text-sm text-white hover:bg-primary-dark"
                    >
                      模拟支付
                    </button>
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="rounded border border-red-300 px-4 py-1.5 text-sm text-red-500 hover:bg-red-50"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
