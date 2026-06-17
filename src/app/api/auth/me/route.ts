import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return apiError("未登录", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        memberLevel: true,
        totalSpent: true,
      },
    });

    if (!user) {
      return apiError("用户不存在", 404);
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error("Get me error:", error);
    return apiError("获取用户信息失败", 500);
  }
}
