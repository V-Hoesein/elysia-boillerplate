import { AppError } from './app-error'
export class UnauthorizedError extends AppError {
  constructor(code: string, message: string, details: unknown = null) {
    super(code, message, 401, details)
  }
}
