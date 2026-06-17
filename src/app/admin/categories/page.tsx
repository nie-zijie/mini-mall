"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, slug: newSlug }),
    });
    if (res.ok) {
      setNewName("");
      setNewSlug("");
      fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error || "创建失败");
    }
  };

  const handleUpdate = async (id: number) => {
    setError("");
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: editSlug }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error || "更新失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该分类？")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error || "删除失败");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">分类管理</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* 新增表单 */}
      <form onSubmit={handleCreate} className="mb-8 flex gap-3">
        <input
          type="text"
          required
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="分类名称"
          className="rounded-lg border px-3 py-2 focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          required
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="Slug (英文)"
          className="rounded-lg border px-3 py-2 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-2 text-sm text-white hover:bg-primary-dark"
        >
          新增
        </button>
      </form>

      {/* 分类列表 */}
      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">名称</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{cat.id}</td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-gray-400">{cat.slug}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {editingId === cat.id ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="text-sm text-primary hover:underline"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-400 hover:underline"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setEditSlug(cat.slug);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
