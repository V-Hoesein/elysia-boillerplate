import { Elysia } from 'elysia'
import { appConfig } from '../config/app.config'
import { userModule } from '../modules/users/user.module'
export function routes(users = userModule()) {
  return new Elysia({ prefix: appConfig.prefix }).use(users)
}
