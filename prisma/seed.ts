import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始种子数据...\n");

  // 清空旧数据
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "手机数码", slug: "phone" } }),
    prisma.category.create({ data: { name: "电脑办公", slug: "computer" } }),
    prisma.category.create({ data: { name: "家用电器", slug: "appliance" } }),
    prisma.category.create({ data: { name: "服装鞋帽", slug: "clothing" } }),
  ]);

  console.log("✅ 分类创建完成");

  // 创建商品
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "iPhone 15 Pro Max",
        description: "A17 Pro 芯片，钛金属设计，4800 万像素",
        price: 8999.0,
        stock: 100,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "华为 Mate 60 Pro",
        description: "麒麟芯片，卫星通话，超强影像",
        price: 6999.0,
        stock: 80,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "小米 14 Ultra",
        description: "徕卡光学，骁龙 8 Gen 3",
        price: 5999.0,
        stock: 120,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "MacBook Air 15",
        description: "M3 芯片，15.3 英寸 Liquid Retina 显示屏",
        price: 10499.0,
        stock: 50,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "ThinkPad X1 Carbon",
        description: "第 12 代酷睿，14 英寸商务轻薄本",
        price: 8999.0,
        stock: 30,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Dyson V15 吸尘器",
        description: "激光探测微尘，智能灰尘感应",
        price: 4999.0,
        stock: 60,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "戴森空气净化扇",
        description: "净化、凉风二合一，HEPA 滤网",
        price: 3999.0,
        stock: 40,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Nike Air Max 270",
        description: "经典气垫跑鞋，舒适缓震",
        price: 1099.0,
        stock: 200,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Adidas Ultraboost 23",
        description: "BOOST 中底科技，能量回弹",
        price: 1299.0,
        stock: 150,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "AirPods Pro 2",
        description: "自适应音频，主动降噪，USB-C",
        price: 1799.0,
        stock: 90,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "iPad Pro M4",
        description: "M4 芯片，超 XDR 显示屏",
        price: 8699.0,
        stock: 45,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "徕芬高速吹风机 SE",
        description: "11 万转/分钟，2 亿负离子",
        price: 399.0,
        stock: 300,
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log("✅ 商品创建完成");

  // 创建用户
  const password = await bcrypt.hash("123456", 12);
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@minimall.com",
      password,
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      username: "test",
      email: "test@minimall.com",
      password,
      role: "USER",
      totalSpent: 9000,
      memberLevel: "XINYUE_1",
    },
  });
  await prisma.user.create({
    data: {
      username: "vip",
      email: "vip@minimall.com",
      password,
      role: "USER",
      totalSpent: 85000,
      memberLevel: "XINYUE_2",
    },
  });

  console.log("✅ 用户创建完成");
  console.log("\n📋 测试账号:");
  console.log("   管理员: admin@minimall.com / 123456");
  console.log("   心悦Lv1: test@minimall.com / 123456");
  console.log("   心悦Lv2: vip@minimall.com / 123456");
  console.log("\n🌱 种子数据导入完成!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
