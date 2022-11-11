import { z } from 'zod'
import { zodEnvToggleOption, zodNumString } from '../../types/zod/schema-helpers'

/**
 * Zod schema used to validate environment variables on load of this app.
 *
 * @see AppModule for configuration of `ConfigModule` where the schema is parsed vs. the environment.
 */
export const envSchema = z.object({
  // api.config.ts
  ORIGIN: z.string().min(1),
  PORT: zodNumString,
  BASE_PATH: z.string().min(1),
  COOKIE_SECRET: z.string().min(1),
  API_OPT_COMPRESSION: zodEnvToggleOption,
  API_OPT_CSRF_PROTECTION: zodEnvToggleOption,
  CSRF_TOKEN_COOKIE_NAME: z.string().min(1),

  // logger.config.ts
  API_TAG: z.string().min(1),
  API_VERSION: z.string().min(1),
  LOG_LEVEL: z.string().min(1),
  API_LOGS_SYNC: zodEnvToggleOption,

  // auth.config.ts
  JWT_ACCESS_TOKEN_SECRET: z.string().min(1),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(1),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: zodNumString,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: zodNumString,

  // health.config.ts
  HEALTH_CHECK_HTTP_PING_URL: z.string().min(1),
  HEALTH_CHECK_MAX_HEAP_MIB: zodNumString,
  HEALTH_CHECK_MAX_RSS_MIB: zodNumString,

  // prisma (prisma depends on DATABASE_URL)
  DB_HOST: z.string().min(1),
  DB_PORT: zodNumString,
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // aws.config.ts
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_SES_SENDER_ADDRESS: z.string().email(),
  AWS_SES_REPLY_TO_ADDRESS: z.string().email(),

  // stripe.config.ts
  STRIPE_API_KEY: z.string().min(1),
  STRIPE_API_KEY_TEST: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // google.config.ts
  GOOGLE_API_KEY: z.string().min(1),
})
