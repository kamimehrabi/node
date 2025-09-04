export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationOptions(query: any): PaginationOptions {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const sort = query.sort || "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";

  return { page, limit, sort, order };
}

export function getSortObject(sort: string, order: "asc" | "desc") {
  const sortObj: any = {};
  sortObj[sort] = order === "asc" ? 1 : -1;
  return sortObj;
}

