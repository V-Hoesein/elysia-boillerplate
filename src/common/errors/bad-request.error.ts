import { AppError } from './app-error'
export class BadRequestError extends AppError {
  constructor(code: string, message: string, details: unknown = null) {
    super(code, message, 400, details)
  }
}
