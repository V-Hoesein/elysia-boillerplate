import { t } from 'elysia'
export const paginationQuery = {
  page: t.Optional(t.Integer({ minimum: 1, maximum: 1000000, default: 1 })),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100, default: 20 })),
}
export function pagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}
export const paginationSchema = t.Object({
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
    hasNextPage: t.Boolean(),
    hasPreviousPage: t.Boolean(),
  }),
})
