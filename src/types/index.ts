// 用户相关
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  memberLevel: string;
  totalSpent: number;
}

// 分类相关
export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}

// 商品相关
export interface ProductInfo {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  status: string;
  categoryId: number;
  category?: CategoryInfo;
  createdAt: string;
}

// 购物车相关
export interface CartItemInfo {
  id: number;
  productId: number;
  quantity: number;
  product: ProductInfo;
}

// 订单相关
export interface OrderItemInfo {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: ProductInfo;
}

export interface OrderInfo {
  id: number;
  userId: number;
  subtotal: number;
  discount: number;
  total: number;
  discountRate: number;
  memberLevel: string;
  status: string;
  items: OrderItemInfo[];
  user?: UserInfo;
  createdAt: string;
}

// API 响应类型
export interface ApiResponse<T> {
  error?: string;
  data?: T;
}
