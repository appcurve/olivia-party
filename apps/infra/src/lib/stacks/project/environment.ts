import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env') })
dotenv.config({ path: path.join(process.cwd(), 'apps/api/.env') })

const REQUIRED_ENV_VARS = [
  'AWS_SES_SENDER_ADDRESS',
  'AWS_SES_REPLY_TO_ADDRESS',
  'JWT_ACCESS_TOKEN_SECRET',
  'JWT_REFRESH_TOKEN_SECRET',
  'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
  'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
  'HEALTH_CHECK_HTTP_PING_URL',
  'HEALTH_CHECK_MAX_HEAP_MIB',
  'HEALTH_CHECK_MAX_RSS_MIB',
]

/**
 * Return an object specifying a subset of the project API's env vars.
 *
 * This is a hopefully temporary refactor (pending completion of the todo below) to help keep the `project.stack.ts`
 * relatively readable.
 *
 * @todo standardize env across project monorepo -- have strong types + validation shared via lib across infra + api
 */
export const getPartialProjectApiEnvVars = (): Record<string, string> => {
  // ensure required env vars are at least set to nontrivial values
  validateEnvVarsOrThrow(REQUIRED_ENV_VARS)

  // quick validation regex (this regex is not suitable for public input validation with global email addresses)
  const emailRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,5}$/
  const sesSenderAddress = process.env.AWS_SES_SENDER_ADDRESS ?? ''
  const sesReplyToAddress = process.env.AWS_SES_REPLY_TO_ADDRESS ?? ''

  if (!emailRegex.test(sesSenderAddress) || !emailRegex.test(sesReplyToAddress)) {
    throw new Error(
      'Environment variables AWS_SES_SENDER_ADDRESS + AWS_SES_REPLY_TO_ADDRESS must be set in .env in project root',
    )
  }

  return {
    // disable console colors (raw color codes can clutter cloudwatch logs and can limit integration/analysis)
    NO_COLOR: '1',

    LOG_LEVEL: 'debug',
    API_LOGS_SYNC: 'ON',

    API_OPT_COMPRESSION: 'ON',
    API_OPT_CSRF_PROTECTION: 'OFF',

    CSRF_TOKEN_COOKIE_NAME: 'CSRF-TOKEN',

    AWS_SES_SENDER_ADDRESS: sesSenderAddress,
    AWS_SES_REPLY_TO_ADDRESS: sesReplyToAddress,

    // @todo move JWT secrets to ssm secret parameters and reference in `secrets`
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? '',
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME ?? '3306',
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME ?? '604800',

    HEALTH_CHECK_HTTP_PING_URL: 'https://google.com',
    HEALTH_CHECK_MAX_HEAP_MIB: '250',
    HEALTH_CHECK_MAX_RSS_MIB: '250',

    // @todo move Stripe secrets to ssm secret parameters and reference in `secrets`
    STRIPE_API_KEY: process.env.STRIPE_API_KEY ?? '',
    STRIPE_API_KEY_TEST: process.env.STRIPE_API_KEY_TEST ?? '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? 'stripe_webhook_secret',
  }
}

/**
 * Validate required env vars are set in process.env.
 *
 * This is a stop-gap to prevent hard-coded secrets in the TS however it is not ideal because:
 *
 * - aws-cdk stacks should deterministically create infrastructure and they cannot if they depend on
 *   environment variable values of a particular dev machine.
 * - secrets may end up in the synthesized CloudFormation or a context file that may be inadvertently
 *   committed.
 *
 * @todo set secrets or secure ssm parameters with app deploy vars
 * @throws Error if any env var name in `REQUIRED_ENV_VARS` is nullish
 */
function validateEnvVarsOrThrow(envVarNames: string[]): true {
  if (!envVarNames.every((varName) => !!process.env[varName])) {
    throw new Error('Missing expected environment vars (ProjectStack).')
  }

  return true
}
