"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const addToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "添加失败");
        return;
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      alert("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={addToCart}
        disabled={loading}
        className="rounded-lg bg-primary px-8 py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {added ? "已加入购物车 ✓" : loading ? "添加中..." : "加入购物车"}
      </button>
      <button
        onClick={() => {
          addToCart().then(() => router.push("/cart"));
        }}
        className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary hover:text-white"
      >
        立即购买
      </button>
    </div>
  );
}
