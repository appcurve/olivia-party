import {
  ClassSerializerInterceptor,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'

import { useContainer } from 'class-validator'
import helmet from 'helmet'
import * as cookieParser from 'cookie-parser'
import * as compression from 'compression'

import { AppModule } from './app.module'
import { PrismaService } from './modules/prisma/prisma.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // @todo - leverage @nestjs/config to centralize origin/port/globalPrefix/compression/etc values
  const origin = process.env.ORIGIN || 'http://localhost:3333'
  const port = process.env.PORT || 3333
  const globalPrefix = `${process.env.BASE_PATH ?? 'api'}/${process.env.API_VERSION ?? 'v1'}`
  const enableCompression = Boolean(process.env.ENABLE_COMPRESSION === 'false' ? false : process.env.ENABLE_COMPRESSION)

  app.setGlobalPrefix(globalPrefix)

  // enable class-validator to use classes via NestJS direct injection (DI)
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // enable provider `onApplicationShutdown()` hooks to be called (also important for health checks)
  app.enableShutdownHooks()

  // add listener for prisma onExit event to prevent prisma from interfering w/ nestjs shutdown hooks
  const prismaService: PrismaService = app.get(PrismaService)
  prismaService.enableShutdownHooks(app)

  // enable ClassSerializerInterceptor to serialize dto/entity classes returned as responses to json
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), { excludeExtraneousValues: true }))

  // configure ValidationPipe to globally process incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip validated object of properties missing validation decorators
      transform: true, // enable class-transformer to transform js objects to classes via `plainToClass()` (use with `@Type()` decorator)
      transformOptions: {
        enableImplicitConversion: false,
      },
      forbidNonWhitelisted: true, // throw if an unrecognized property is received
      forbidUnknownValues: true, // recommended per class-validator npm page
      // disableErrorMessages: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) =>
        new UnprocessableEntityException({
          message: 'Unprocessable Entity',
          errors: errors.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.property]: Object.values(curr.constraints ?? {}).join(', '),
            }),
            {},
          ),
        }),
    }),
  )

  // enable cors for REST endpoints only (graphql/apollo requires separate configuration if in use)
  app.enableCors({
    origin,
    credentials: true, // required for auth cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // allowedHeaders: ...
  })

  // use cookie-parser express middleware to populate `req.cookies`
  app.use(cookieParser())

  // conditionally enable express middleware for compression
  if (enableCompression) {
    Logger.log('Enabling compression via express middleware')
    app.use(compression())
  }

  // use helmet to add common http headers that enhance security
  app.use(helmet())

  const httpServer = await app.listen(port, () => {
    Logger.log(`🚀 Application environment: ${process.env.NODE_ENV}`)
    Logger.log(`🚀 Application listening on port ${port} at path /${globalPrefix}`)
    Logger.log(`🚀 Accepting requests from origin: ${origin}`)
  })

  const url = await app.getUrl()
  Logger.log(`🚀 Application running: ${url}`)

  if (process.env.NODE_ENV === 'development') {
    Logger.log(`🚀 Local development URL: http://localhost:${port}/${globalPrefix}`)
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
