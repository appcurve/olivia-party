import { Server } from 'http'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from 'nestjs-pino'

import { configureNestExpressApp } from './configure'

import { AppModule } from './app.module'
import type { ApiConfig } from './config/types/api-config.interface'
import { assertNonNullable } from './types/type-assertions/assert-non-nullable'
import { assertValidEnv } from './config/schema/env-schema'

async function bootstrap(): Promise<Server> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // @see <https://github.com/iamolegga/nestjs-pino>
  })

  const logger = app.get(Logger)
  app.useLogger(logger)

  assertValidEnv()

  const configService = app.get<ConfigService>(ConfigService)
  const apiConfig = configService.get<ApiConfig>('api')

  assertNonNullable(apiConfig, 'Configuration error: missing ApiConfig')
  const { origin, port, globalPrefix } = apiConfig

  await configureNestExpressApp(app, apiConfig, logger)

  const httpServer = await app.listen(port, () => {
    logger.log(`🚀 Application environment: ${process.env.NODE_ENV}`)
    logger.log(`🚀 Application listening on port ${port} at path /${globalPrefix}`)
    logger.log(`🚀 Accepting requests from origin: ${origin}`)
  })

  const url = await app.getUrl()
  logger.log(`🚀 Application running: ${url}`)

  if (process.env.NODE_ENV === 'development') {
    logger.log(`🚀 Local development URL: http://localhost:${port}/${globalPrefix}`)
  }

  return httpServer
}

try {
  bootstrap()
} catch (error: unknown) {
  console.error('Error bootstrapping NestJS application')
  console.error((error instanceof Error && error.message) || String(error))

  if (error instanceof Error && error.stack) {
    console.error(error.stack || 'No stack trace available')
  }
}
