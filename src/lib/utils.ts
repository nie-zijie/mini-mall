// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 解析分页搜索参数
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10))
  );
  return { page, pageSize };
}

// 构建分页响应
export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  { page, pageSize }: PaginationParams
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 错误响应
export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

// 成功响应
export function apiSuccess<T>(data: T, status: number = 200) {
  return Response.json(data, { status });
}
