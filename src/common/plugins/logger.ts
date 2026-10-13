import { Elysia } from 'elysia'
import { logger } from '../../infrastructure/logger/logger'
export const loggerPlugin = new Elysia({ name: 'logger' })
  .decorate('logger', logger)
  .decorate('userId', '')
