import { Elysia } from 'elysia'
import { requestId } from './request-id'
import { loggerPlugin } from '../plugins/logger'
export const requestLogger = new Elysia({ name: 'request-logger' })
  .use(requestId)
  .use(loggerPlugin)
  .onAfterResponse(
    { as: 'global' },
    ({ request, requestId, startedAt, logger, set, responseValue, userId }) => {
      logger.info(
        {
          requestId,
          ...(userId ? { userId } : {}),
          method: request.method,
          path: new URL(request.url).pathname,
          statusCode:
            responseValue instanceof Response
              ? responseValue.status
              : Number(set.status ?? 200),
          duration: Math.round(performance.now() - startedAt),
        },
        'Request completed',
      )
    },
  )
