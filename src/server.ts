import { createApp } from './app'
import { env } from './config/env'
import { appConfig } from './config/app.config'
import { pool } from './infrastructure/database/db'
import { logger } from './infrastructure/logger/logger'

pool.on('error', () => logger.error('Idle database connection error'))
const app = createApp().listen({
  hostname: env.APP_HOST,
  port: env.APP_PORT,
  maxRequestBodySize: appConfig.maxBodySize,
})
logger.info({ host: env.APP_HOST, port: env.APP_PORT }, 'Application started')
let stopping = false
async function shutdown(signal: string) {
  if (stopping) return
  stopping = true
  logger.info({ signal }, 'Application shutting down')
  const timeout = setTimeout(() => process.exit(1), 10000)
  timeout.unref()
  try {
    await app.stop()
    await pool.end()
    logger.flush()
    process.exitCode = 0
  } catch {
    logger.error('Graceful shutdown failed')
    process.exitCode = 1
  } finally {
    clearTimeout(timeout)
  }
}
process.once('SIGINT', () => {
  void shutdown('SIGINT')
})
process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})
