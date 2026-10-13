import { asc, desc, eq, ilike } from 'drizzle-orm'
import {
  db,
  type Database,
  type Transaction,
} from '../../infrastructure/database/db'
import { user } from '../../infrastructure/database/schema'
import type { UserQuery } from './user.schema'
const publicFields = {
  id: user.id,
  name: user.name,
  image: user.image,
  createdAt: user.createdAt,
}
export function createUserRepository(database: Database | Transaction = db) {
  return {
    async findById(id: string) {
      const [result] = await database
        .select(publicFields)
        .from(user)
        .where(eq(user.id, id))
        .limit(1)
      return result
    },
    async findMany(query: UserQuery) {
      const page = query.page ?? 1,
        limit = query.limit ?? 20
      const filter = query.search
        ? ilike(user.name, `%${query.search.replace(/[\\%_]/g, '\\$&')}%`)
        : undefined
      const sort = query.sort === 'name' ? user.name : user.createdAt
      const direction = query.order === 'asc' ? asc : desc
      const [data, total] = await Promise.all([
        database
          .select(publicFields)
          .from(user)
          .where(filter)
          .orderBy(direction(sort), direction(user.id))
          .limit(limit)
          .offset((page - 1) * limit),
        database.$count(user, filter),
      ])
      return { data, total }
    },
  }
}
export const userRepository = createUserRepository()
