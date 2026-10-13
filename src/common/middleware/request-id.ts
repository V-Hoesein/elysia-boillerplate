import { Elysia } from 'elysia'
export const requestId = new Elysia({ name: 'request-id' })
  .decorate('requestId', '')
  .decorate('startedAt', 0)
  .onRequest((context) => {
    const incoming = context.request.headers.get('x-request-id')
    const id =
      incoming && /^[a-zA-Z0-9._-]{1,128}$/.test(incoming)
        ? incoming
        : crypto.randomUUID()
    context.requestId = id
    context.startedAt = performance.now()
    context.set.headers['x-request-id'] = id
    context.set.headers['x-content-type-options'] = 'nosniff'
    context.set.headers['x-frame-options'] = 'DENY'
    context.set.headers['referrer-policy'] = 'no-referrer'
  })
  .as('global')
