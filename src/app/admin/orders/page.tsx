"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: number;
  productName: string;
  product: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user: { username: string; email: string };
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrders();
    } else {
      const data = await res.json();
      alert(data.error || "更新失败");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400">加载中...</div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">订单管理</h1>

      {orders.length === 0 ? (
        <div className="py-20 text-center text-gray-400">暂无订单</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">
                    订单号：#{order.id} | 用户：{order.user.username} ({order.user.email}) |{" "}
                    {new Date(order.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
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

              <div className="space-y-1 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.productName || item.product?.name} × {item.quantity}</span>
                    <span>¥{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t pt-3 text-sm">
                {order.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>会员折扣 ({(Number(order.discountRate) * 10).toFixed(0)}折)</span>
                    <span>-¥{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>实付</span>
                  <span className="text-red-500">¥{Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {order.status === "PAID" && (
                  <button
                    onClick={() => handleStatusChange(order.id, "SHIPPED")}
                    className="rounded bg-primary px-4 py-1.5 text-sm text-white hover:bg-primary-dark"
                  >
                    标记已发货
                  </button>
                )}
                {order.status === "SHIPPED" && (
                  <button
                    onClick={() => handleStatusChange(order.id, "COMPLETED")}
                    className="rounded bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700"
                  >
                    标记已完成
                  </button>
                )}
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleStatusChange(order.id, "CANCELLED")}
                    className="rounded border border-red-300 px-4 py-1.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    取消订单
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
