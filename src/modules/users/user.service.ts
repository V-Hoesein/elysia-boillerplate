import { NotFoundError } from '../../common/errors/not-found.error'
import { pagination } from '../../common/http/pagination'
import { userRepository } from './user.repository'
import type { UserQuery } from './user.schema'
export function createUserService(repository = userRepository) {
  return {
    async findById(id: string) {
      const user = await repository.findById(id)
      if (!user) throw new NotFoundError('USER_NOT_FOUND', 'User not found')
      return user
    },
    async findMany(query: UserQuery) {
      const { data, total } = await repository.findMany(query)
      return {
        data,
        meta: {
          pagination: pagination(query.page ?? 1, query.limit ?? 20, total),
        },
      }
    },
  }
}
export const userService = createUserService()
