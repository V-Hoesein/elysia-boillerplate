import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { authConfig } from '../../config/auth.config'
import { db } from '../database/db'
import * as schema from '../database/schema'
export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
})
