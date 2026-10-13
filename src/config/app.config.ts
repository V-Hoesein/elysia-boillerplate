import { env } from './env'
export const appConfig = {
  name: env.APP_NAME,
  prefix: '/api/v1',
  maxBodySize: 1024 * 1024,
}
