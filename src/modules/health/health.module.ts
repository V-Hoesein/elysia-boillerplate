import { Elysia, t } from 'elysia'
import { pool } from '../../infrastructure/database/db'
import { env } from '../../config/env'
import {
  success,
  successSchema,
  errorSchema,
} from '../../common/http/api-response'
import { AppError } from '../../common/errors/app-error'
const healthSchema = successSchema(
  t.Object({
    status: t.Literal('ok'),
    timestamp: t.String(),
    uptime: t.Number(),
    environment: t.String(),
  }),
)
export const checkDatabase = async () => {
  await pool.query('SELECT 1')
}
export function healthModule(checkReady = checkDatabase) {
  const health = () =>
    success(
      {
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
      },
      'Application healthy',
    )
  return new Elysia({ prefix: '/health', tags: ['Health'] })
    .get('', health, { response: healthSchema })
    .get('/live', health, { response: healthSchema })
    .get(
      '/ready',
      async () => {
        try {
          await checkReady()
        } catch {
          throw new AppError(
            'SERVICE_UNAVAILABLE',
            'Application not ready',
            503,
          )
        }
        return health()
      },
      { response: { 200: healthSchema, 503: errorSchema } },
    )
}
