import { AppError } from './app-error'
export class ConflictError extends AppError {
  constructor(code: string, message: string, details: unknown = null) {
    super(code, message, 409, details)
  }
}
