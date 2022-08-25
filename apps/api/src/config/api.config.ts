import { registerAs } from '@nestjs/config'
import { mapEnvVarsToConfigOptionFlags } from './lib/env-mapper'
import type { ApiConfig } from './types/api-config.interface'

const requiredEnvsKeyMap: Record<string, keyof ApiConfig['options']> = {
  API_OPT_COMPRESSION: 'compression',
  API_OPT_CSRF_PROTECTION: 'csrfProtection',
}

export default registerAs('api', (): ApiConfig => {
  return {
    origin: process.env.ORIGIN || 'http://localhost:3333',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
    globalPrefix: `${process.env.BASE_PATH ?? 'api'}/${process.env.API_VERSION ?? 'v1'}`,
    meta: {
      projectTag: process.env.API_PROJECT_TAG ?? 'fx',
    },
    options: mapEnvVarsToConfigOptionFlags(requiredEnvsKeyMap),
  }
})