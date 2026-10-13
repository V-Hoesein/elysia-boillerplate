import { openapi } from '@elysiajs/openapi'
import { appConfig } from '../../config/app.config'
export const openapiPlugin = openapi({
  path: '/docs',
  specPath: '/openapi.json',
  documentation: {
    info: { title: appConfig.name, version: '1.0.0' },
    components: {
      securitySchemes: {
        session: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
        },
      },
    },
  },
})
