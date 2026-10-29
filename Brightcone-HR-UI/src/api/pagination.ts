/** The shape the backend uses for every paged list (`?page=1&page_size=25`). */
export type PageOf<T> = {
  results: T[]
  pagination: {
    page: number
    page_size: number
    total_pages: number
    total_items: number
  }
}

/** Builds `?page=2&page_size=25` and leaves out values that were not given. */
export function pageQuery(params: { page?: number; pageSize?: number } = {}): string {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.pageSize !== undefined) query.set('page_size', String(params.pageSize))
  const text = query.toString()
  return text ? `?${text}` : ''
}
