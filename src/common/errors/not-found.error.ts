import { AppError } from './app-error'
export class NotFoundError extends AppError {
  constructor(code: string, message: string, details: unknown = null) {
    super(code, message, 404, details)
  }
}
