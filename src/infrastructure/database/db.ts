import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../../config/env'
import * as schema from './schema'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
})
export const db = drizzle({ client: pool, schema })
export type Database = typeof db
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
