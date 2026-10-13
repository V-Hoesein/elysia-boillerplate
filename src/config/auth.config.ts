import { env } from './env'
export const authConfig = {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: env.trustedOrigins,
  emailAndPassword: { enabled: true },
  advanced: { useSecureCookies: env.NODE_ENV === 'production' },
  rateLimit: { enabled: env.NODE_ENV !== 'test' },
}
