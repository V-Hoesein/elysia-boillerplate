import { Elysia } from 'elysia'
import { AppError } from '../errors/app-error'
import { loggerPlugin } from './logger'
import { requestId } from '../middleware/request-id'
export const errorHandler = new Elysia({ name: 'error-handler' })
  .use(loggerPlugin)
  .use(requestId)
  .onError({ as: 'global' }, ({ code, error, set, logger, requestId }) => {
    let status = 500
    let errorCode = 'INTERNAL_SERVER_ERROR'
    let message = 'Internal server error'
    let details: unknown = null
    if (error instanceof AppError) {
      status = error.statusCode
      errorCode = error.code
      message = error.message
      details = error.details
    } else if (code === 'VALIDATION') {
      status = 422
      errorCode = 'VALIDATION_ERROR'
      message = 'Validation failed'
      details = error.all.map((issue) => ({
        field: issue.path,
        message: 'Invalid value',
      }))
    } else if (code === 'NOT_FOUND') {
      status = 404
      errorCode = 'RESOURCE_NOT_FOUND'
      message = 'Route not found'
    } else if (code === 'PARSE') {
      status = 400
      errorCode = 'BAD_REQUEST'
      message = 'Malformed request'
    } else {
      // Database errors can contain query values; keep those out of logs.
      logger.error(
        {
          requestId,
          errorType: error instanceof Error ? error.name : 'UnknownError',
        },
        'Unhandled application error',
      )
    }
    set.status = status
    return {
      success: false as const,
      message,
      error: { code: errorCode, details },
    }
  })
