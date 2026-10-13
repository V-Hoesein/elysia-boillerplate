import { t } from 'elysia'
import { paginationQuery } from '../../common/http/pagination'
export const userParams = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
})
export const userQuery = t.Object({
  ...paginationQuery,
  search: t.Optional(t.String({ maxLength: 100 })),
  sort: t.Optional(
    t.Union([t.Literal('createdAt'), t.Literal('name')], {
      default: 'createdAt',
    }),
  ),
  order: t.Optional(
    t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'desc' }),
  ),
})
export const publicUserSchema = t.Object({
  id: t.String(),
  name: t.String(),
  image: t.Nullable(t.String()),
  createdAt: t.Date(),
})
export type UserQuery = typeof userQuery.static
