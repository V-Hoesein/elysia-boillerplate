import { Elysia, t } from 'elysia'
import { auth } from '../../infrastructure/auth/auth'
import { loggerPlugin } from '../../common/plugins/logger'
import { UnauthorizedError } from '../../common/errors/unauthorized.error'
import {
  success,
  successSchema,
  errorSchema,
} from '../../common/http/api-response'
import { paginationSchema } from '../../common/http/pagination'
import { userService } from './user.service'
import { publicUserSchema, userParams, userQuery } from './user.schema'

export function userModule(
  service = userService,
  getSession = (headers: Headers) => auth.api.getSession({ headers }),
) {
  return new Elysia({ prefix: '/users', tags: ['Users'] })
    .use(loggerPlugin)
    .onBeforeHandle(async (context) => {
      const session = await getSession(context.request.headers)
      if (!session)
        throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required')
      context.userId = session.user.id
    })
    .get(
      '',
      async ({ query }) => {
        const { data, meta } = await service.findMany(query)
        return success(data, 'Users retrieved successfully', meta)
      },
      {
        query: userQuery,
        response: {
          200: successSchema(t.Array(publicUserSchema), paginationSchema),
          401: errorSchema,
          422: errorSchema,
        },
        detail: { security: [{ session: [] }] },
      },
    )
    .get(
      '/:id',
      async ({ params }) =>
        success(
          await service.findById(params.id),
          'User retrieved successfully',
        ),
      {
        params: userParams,
        response: {
          200: successSchema(publicUserSchema),
          401: errorSchema,
          404: errorSchema,
          422: errorSchema,
        },
        detail: { security: [{ session: [] }] },
      },
    )
}
