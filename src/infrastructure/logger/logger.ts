import pino from 'pino'
import { env } from '../../config/env'

export const loggerOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  base: { app: env.APP_NAME },
  redact: {
    paths: [
      'authorization',
      'cookie',
      'password',
      'accessToken',
      'refreshToken',
      'sessionToken',
      'BETTER_AUTH_SECRET',
      '*.authorization',
      '*.cookie',
      '*.password',
      '*.accessToken',
      '*.refreshToken',
      '*.sessionToken',
      '*.BETTER_AUTH_SECRET',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
}
export const logger = pino({
  ...loggerOptions,
  ...(env.NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
})
