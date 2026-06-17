"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDiscountRate, MemberLevel } from "@/lib/member";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string;
    status: string;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    memberLevel: string;
  } | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const [cartRes, userRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/auth/me"),
      ]);

      if (cartRes.status === 401) {
        router.push("/login");
        return;
      }

      const cartData = await cartRes.json();
      setItems(cartData);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
    } catch {
      console.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    const res = await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    if (res.ok) {
      if (quantity === 0) {
        setItems(items.filter((i) => i.id !== id));
      } else {
        setItems(
          items.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
      }
    } else {
      const data = await res.json();
      alert(data.error || "更新失败");
    }
  };

  const removeItem = async (id: number) => {
    const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const createOrder = async () => {
    const res = await fetch("/api/orders", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      router.push(`/orders/${data.id}`);
    } else {
      alert(data.error || "下单失败");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  const discountRate = user
    ? getDiscountRate(user.memberLevel as MemberLevel)
    : 1.0;
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );
  const discount = subtotal * (1 - discountRate);
  const total = subtotal - discount;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">购物车</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-lg">购物车是空的</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border bg-white p-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-300">📦</span>
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-400">
                    单价: ¥{Number(item.product.price).toFixed(2)}
                    {discountRate < 1 && (
                      <span className="ml-2 text-red-500">
                        会员价: ¥{(Number(item.product.price) * discountRate).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-100"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-100"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        Math.min(item.product.stock, item.quantity + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          {/* 汇总 */}
          <div className="mt-6 rounded-lg border bg-white p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>原价小计</span>
                <span>¥{subtotal.toFixed(2)}</span>
              </div>
              {discountRate < 1 && (
                <div className="flex justify-between text-red-500">
                  <span>会员折扣 ({(discountRate * 10).toFixed(0)}折)</span>
                  <span>-¥{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>实付</span>
                <span className="text-red-500">¥{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={createOrder}
              className="mt-4 w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark"
            >
              提交订单
            </button>
          </div>
        </>
      )}
    </div>
  );
}
