export interface Pagination {
  page: number
  totalPages: number
  totalItems: number
  from: number
  to: number
}

export interface PaginatedData<T> {
  data: T[] | undefined
  pagination: Pagination
}
