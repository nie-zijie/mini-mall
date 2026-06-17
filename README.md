# Mini Mall 微型商城

基于 Next.js 16 的全栈电商项目，支持商品浏览、用户认证、购物车、订单管理、后台管理，以及心悦会员三级折扣系统。

## 技术栈

| 层面 | 选型 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | TailwindCSS 4 |
| 数据库 | SQLite + Prisma 6 |
| 认证 | JWT + jose + httpOnly Cookie |
| 校验 | Zod |

## 功能

**前台商城**
- 商品列表（分页、搜索、分类筛选）
- 商品详情（会员价展示）
- 用户注册 / 登录
- 购物车（增删改查）
- 下单（事务保证库存安全）
- 模拟支付
- 订单管理
- 个人中心（等级、消费进度）

**后台管理**
- 仪表盘（统计 + 会员概览）
- 商品 CRUD
- 分类管理
- 订单管理（状态流转）
- 用户管理（含会员等级查看）

**心悦会员系统**
| 等级 | 累计消费 | 折扣 |
|------|---------|------|
| 普通用户 | < ¥8,000 | 原价 |
| 心悦 Lv1 | ≥ ¥8,000 | 9 折 |
| 心悦 Lv2 | ≥ ¥80,000 | 8 折 |
| 心悦 Lv3 | ≥ ¥800,000 | 7 折 |

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/nie-zijie/mini-mall.git
cd mini-mall

# 2. 安装依赖
npm install

# 3. 初始化数据库 + 种子数据
npx prisma db push
npx tsx prisma/seed.ts

# 4. 启动开发服务器
npm run dev

# 5. 浏览器打开
# http://localhost:3000
```

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | 123456 |
| 心悦 Lv1 | test@minimall.com | 123456 |
| 心悦 Lv2 | vip@minimall.com | 123456 |

## 目录结构

```
src/
├── app/
│   ├── (shop)/          # 前台商城
│   ├── (auth)/          # 登录 / 注册
│   ├── admin/           # 后台管理
│   └── api/             # REST API
├── lib/                 # 工具函数
│   ├── prisma.ts        # 数据库连接
│   ├── auth.ts          # JWT 认证
│   ├── member.ts        # 会员等级
│   └── utils.ts         # 通用工具
├── middleware.ts         # 路由守卫
└── types/               # TS 类型
```

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run db:studio    # 打开 Prisma Studio（可视化管理数据）
npm run db:seed      # 重置数据库并填充种子数据
```
