"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      router.push("/login");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            用户名
          </label>
          <input
            type="text"
            required
            minLength={2}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="请输入用户名"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            邮箱
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="请输入邮箱"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            密码
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="至少 6 位密码"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            确认密码
          </label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="再次输入密码"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        已有账号？{" "}
        <Link href="/login" className="text-primary hover:underline">
          立即登录
        </Link>
      </p>
    </>
  );
}
