import { prisma } from "@/lib/prisma";
import { MEMBER_LABELS } from "@/lib/member";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      totalSpent: true,
      memberLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">用户管理</h1>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">用户名</th>
              <th className="px-4 py-3 text-left">邮箱</th>
              <th className="px-4 py-3 text-center">角色</th>
              <th className="px-4 py-3 text-right">累计消费</th>
              <th className="px-4 py-3 text-center">心悦等级</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role === "ADMIN" ? "管理员" : "用户"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  ¥{Number(u.totalSpent).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.memberLevel === "NONE"
                        ? "bg-gray-100 text-gray-600"
                        : u.memberLevel === "XINYUE_1"
                        ? "bg-amber-100 text-amber-700"
                        : u.memberLevel === "XINYUE_2"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {MEMBER_LABELS[u.memberLevel as keyof typeof MEMBER_LABELS]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
