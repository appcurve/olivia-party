import type { NestExpressApplication } from '@nestjs/platform-express'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'
import { useContainer } from 'class-validator'

import type { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import * as cookieParser from 'cookie-parser'
import * as csurf from 'csurf'
import * as compression from 'compression'

import { AppModule } from './app.module'
import { PrismaService } from './modules/prisma/prisma.service'
import { ApiConfig } from './config/types/api-config.interface'

/**
 * Configure the given `NestExpressApplication` and apply project middleware.
 */
export async function configureNestExpressApp(
  app: NestExpressApplication,
  apiConfig: ApiConfig,
  logger: Logger,
): Promise<void> {
  const { origin, globalPrefix } = apiConfig

  // set global prefix for api (e.g. `api/v1`)
  app.setGlobalPrefix(globalPrefix, {
    exclude: [], // e.g. ['/path/to/healthcheck', '/path/to/hook']
  })

  // disable underlying expressjs from identifying itself in response headers
  app.disable('x-powered-by')

  // enable class-validator to use classes via NestJS direct injection (DI)
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // enable provider `onApplicationShutdown()` hooks to be called (also important for health checks)
  app.enableShutdownHooks()

  // add listener for prisma onExit event to prevent prisma from interfering w/ nestjs shutdown hooks
  const prismaService: PrismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)

  // use nestjs-pino LoggerErrorInterceptor to capture full error details in error logs
  app.useGlobalInterceptors(new LoggerErrorInterceptor())

  // enable cors for REST endpoints only (note: graphql/apollo requires separate configuration if used)
  app.enableCors({
    origin,
    credentials: true, // required for auth cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // allowedHeaders: ...
  })

  // cookie-parser (express middleware) populates `req.cookies`
  // this middleware must be registered BEFORE csrf-protection middleware that uses a cookie strategy
  app.use(cookieParser(apiConfig.cookies.secret))

  // ** DEPRECATION ALERT **
  // @todo need new csrf protection implementation: csurf was just deprecated due to several issues + vulnerabilities
  // @see https://portswigger.net/daily-swig/csrf-flaw-in-csurf-npm-package-aimed-at-protecting-against-the-same-flaws
  // @see https://github.com/Psifi-Solutions/csrf-csrf
  //
  // conditionally enable csurf (express middleware) for csrf/xsrf protection (initializion must follow cookie-parser)
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
  if (apiConfig.options.csrfProtection) {
    // the _csrf cookie stores the token secret client-side so httpOnly is required to block access by js
    const csurfMiddleware = csurf({
      cookie: { key: '_csrf', sameSite: 'strict', httpOnly: true, secure: process.env.NODE_ENV === 'production' },
    })

    // csurf is added via middleware function to provide a lever for conditionally disabling csrf protection by route
    app.use((req: Request, res: Response, next: NextFunction) => {
      // example of disabling csrf protection for a given path
      // if (req.path === `${globalPrefix}/example-route/example`) { return next() }
      // note: auth routes used by ui's should always have csrf protection enabled to mitigate login csrf attacks

      csurfMiddleware(req, res, next)
    })

    // send csrf token to client via cookie in every request - client js must read the value and include via http header
    // the csurf middleware supports a few client request headers including CSRF-TOKEN, XSRF-TOKEN, X-XSRF-TOKEN, etc
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.cookie('CSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
      next()
    })
  }

  // conditionally enable express middleware for compression
  if (apiConfig.options.compression) {
    logger.log('Enabling compression via express middleware')
    app.use(compression())
  }

  // use helmet to add common http headers that enhance security
  app.use(
    helmet({
      // example of specifying CSP is required (if implementation will not be handled at the infra level):
      // contentSecurityPolicy: { directives: {...} }
    }),
  )
}
