import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

const registerSchema = z.object({
  username: z.string().min(2, "用户名至少 2 个字符"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { username, email, password } = parsed.data;

    // 检查邮箱是否已注册
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      return apiError(
        existing.email === email ? "邮箱已被注册" : "用户名已被占用"
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        memberLevel: true,
      },
    });

    // 注册后自动登录
    const token = await signToken({
      userId: user.id,
      role: user.role,
    });
    await setAuthCookie(token);

    return apiSuccess({ user }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return apiError("注册失败，请重试", 500);
  }
}
