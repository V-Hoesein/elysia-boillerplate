import { Elysia } from 'elysia'
import { auth } from './infrastructure/auth/auth'
import { requestLogger } from './common/middleware/request-logger'
import { errorHandler } from './common/plugins/error-handler'
import { corsPlugin } from './common/plugins/cors'
import { openapiPlugin } from './common/plugins/openapi'
import { healthModule } from './modules/health/health.module'
import { routes } from './routes'
import type { userModule } from './modules/users/user.module'

export function createApp(
  options: {
    checkReady?: () => Promise<void>
    users?: ReturnType<typeof userModule>
  } = {},
) {
  return new Elysia()
    .use(requestLogger)
    .use(errorHandler)
    .use(corsPlugin)
    .use(openapiPlugin)
    .all('/api/auth/*', ({ request }) => auth.handler(request), {
      parse: 'none',
      detail: { hide: true },
    })
    .use(healthModule(options.checkReady))
    .use(routes(options.users))
}
