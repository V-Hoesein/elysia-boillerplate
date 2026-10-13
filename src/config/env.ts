import { t } from 'elysia'
import { Value } from '@sinclair/typebox/value'

export const envSchema = t.Object({
  NODE_ENV: t.Union(
    [t.Literal('development'), t.Literal('test'), t.Literal('production')],
    { default: 'development' },
  ),
  APP_NAME: t.String({ minLength: 1, default: 'elysia-api' }),
  APP_HOST: t.String({ minLength: 1, default: '0.0.0.0' }),
  APP_PORT: t.Numeric({
    minimum: 1,
    maximum: 65535,
    multipleOf: 1,
    default: 3000,
  }),
  APP_URL: t.String({ format: 'uri', default: 'http://localhost:3000' }),
  DATABASE_URL: t.String({ pattern: '^postgres(ql)?://', minLength: 1 }),
  BETTER_AUTH_SECRET: t.String({ minLength: 32 }),
  BETTER_AUTH_URL: t.String({
    format: 'uri',
    default: 'http://localhost:3000',
  }),
  TRUSTED_ORIGINS: t.String({ minLength: 1, default: 'http://localhost:3000' }),
  LOG_LEVEL: t.Union(
    ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'].map(
      (value) => t.Literal(value),
    ),
    { default: 'info' },
  ),
})

export function validateEnv(input: Record<string, unknown>) {
  const values = Value.Convert(
    envSchema,
    Value.Default(envSchema, { ...input }),
  )
  const errors = [...Value.Errors(envSchema, values)]
  if (errors.length)
    throw new Error(
      `Invalid environment: ${errors.map((error) => error.path).join(', ')}`,
    )
  const parsed = Value.Decode(envSchema, values)
  for (const key of ['APP_URL', 'BETTER_AUTH_URL'] as const) {
    const url = new URL(parsed[key])
    if (!['http:', 'https:'].includes(url.protocol))
      throw new Error(`Invalid environment: ${key}`)
    if (parsed.NODE_ENV === 'production' && url.protocol !== 'https:')
      throw new Error(`${key} must use HTTPS in production`)
  }
  const trustedOrigins = parsed.TRUSTED_ORIGINS.split(',').map((origin) =>
    origin.trim(),
  )
  for (const origin of trustedOrigins) {
    const url = new URL(origin)
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin)
      throw new Error('TRUSTED_ORIGINS must contain exact HTTP origins')
    if (parsed.NODE_ENV === 'production' && url.protocol !== 'https:')
      throw new Error('TRUSTED_ORIGINS must use HTTPS in production')
  }
  return { ...parsed, trustedOrigins }
}

export const env = validateEnv(process.env)
