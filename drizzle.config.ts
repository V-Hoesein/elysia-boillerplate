import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env'
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/*.ts',
  out: './src/infrastructure/database/migrations',
  dbCredentials: { url: env.DATABASE_URL },
})
