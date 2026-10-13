import { cors } from '@elysiajs/cors'
import { env } from '../../config/env'
export const corsPlugin = cors({
  origin: env.trustedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposeHeaders: ['X-Request-ID'],
})
