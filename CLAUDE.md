# Mini Mall 项目规范

## 技术栈
- 框架：Next.js 16 (App Router) + TypeScript
- 样式：TailwindCSS 4
- 数据库：SQLite + Prisma 6
- 认证：JWT + jose + httpOnly Cookie
- 校验：Zod

## 目录结构
- src/app/ — 页面和 API Route
  - (shop)/ — 前台商城（首页、商品详情、搜索、购物车、订单、个人中心）
  - (auth)/ — 认证页面（登录、注册）
  - admin/ — 后台管理（仪表盘、商品、分类、订单、用户）
  - api/ — RESTful API
- src/components/ — 可复用组件（shop/ admin/ ui/）
- src/lib/ — 工具函数（prisma.ts、auth.ts、member.ts、utils.ts）
- src/types/ — TS 类型定义
- prisma/ — 数据库模型 + 种子数据
- middleware.ts — JWT 路由守卫

## 命名规范
- 文件名：kebab-case（如 product-card.tsx）
- 组件：PascalCase（如 ProductCard）
- 函数：camelCase（如 getProducts）
- API 路由：RESTful（GET/POST/PUT/DELETE）

## 约定
- 所有 UI 文案和注释用中文
- 优先使用 Server Components 做数据获取
- Client Components 仅用于交互（表单、按钮、状态切换）
- API 返回 JSON，错误返回 { error: string }
- 价格字段使用 Decimal，避免 Float 精度问题
- 订单中的商品信息做快照存储，防止后续修改影响历史数据
- 下单使用 Prisma 事务保证数据一致性

## 心悦会员系统
- NONE → 原价（累计 < ¥8,000）
- XINYUE_1 → 9折（累计 ≥ ¥8,000）
- XINYUE_2 → 8折（累计 ≥ ¥80,000）
- XINYUE_3 → 7折（累计 ≥ ¥800,000）
- 支付完成后自动累加 totalSpent 并重算等级

## 测试账号
- 管理员：admin@minimall.com / 123456
- 心悦Lv1：test@minimall.com / 123456 (累计 ¥9,000)
- 心悦Lv2：vip@minimall.com / 123456 (累计 ¥85,000)
