import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return apiError("邮箱或密码错误", 401);
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return apiError("邮箱或密码错误", 401);
    }

    const token = await signToken({
      userId: user.id,
      role: user.role,
    });
    await setAuthCookie(token);

    return apiSuccess({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        memberLevel: user.memberLevel,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("登录失败，请重试", 500);
  }
}
