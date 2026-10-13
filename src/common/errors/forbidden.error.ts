import { AppError } from './app-error'
export class ForbiddenError extends AppError {
  constructor(code: string, message: string, details: unknown = null) {
    super(code, message, 403, details)
  }
}
