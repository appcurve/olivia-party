import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core'

import apiConfig from './config/api.config'
import authConfig from './config/auth.config'
import loggerConfig from './config/logger.config'
import healthConfig from './config/health.config'
import awsConfig from './config/aws.config'
import stripeConfig from './config/stripe.config'
import googleConfig from './config/google.config'

import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { AppConfig } from './config/types/app-config.interface'
import { LoggerConfig } from './config/types/logger-config.interface'
import { HealthModule } from './modules/health/health.module'
import { StripeModule } from './modules/stripe/stripe.module'
import { assertNonNullable } from './types/type-assertions/assert-non-nullable'
import { AwsModule } from './modules/aws/aws.module'
import { OpxModule } from './modules/opx/opx.module'
import { YouTubeModule } from './modules/youtube/youtube.module'
import { UsersModule } from './modules/users/users.module'
import { PlayerModule } from './modules/player/player.module'
import { envSchema } from './config/schema/env-schema'
import { ZodDtoValidationPipe } from './shared/pipes/zod-dto-validation-pipe'

// import { SanitizeResponseInterceptor } from './shared/interceptors/sanitize-response.interceptor'
// import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'
// import { ZodSerializerInterceptor } from './shared/interceptors/zod-serializer.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true, // cache process.env in-memory for improved performance of lookups
      load: [authConfig, apiConfig, loggerConfig, healthConfig, awsConfig, stripeConfig, googleConfig],
      validate: (env) => envSchema.parse(env),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const loggerConfig = configService.get<LoggerConfig>('logger')
        assertNonNullable(loggerConfig, 'Missing expected LoggerConfig')

        return loggerConfig.nestJsPino
      },
    }),
    HealthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    AwsModule,
    StripeModule,
    YouTubeModule,
    OpxModule,
    PlayerModule,
  ],
  controllers: [],

  /**
   * Specifying global providers here in AppModule vs. configure.ts/main.ts (via `app.useGlobal*()` methods)
   * has the advantage of module context which enables them to inject dependencies.
   */
  providers: [
    // uncomment to require authentication + protect all routes by default with JwtAuthGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },

    // @todo @temp disable request logging powered by LoggingInterceptor for sanity in development
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },

    /**
     * ZodDtoValidationPipe: enhanced take on ZodValidationPipe from '@anatine/zod-nestjs' that returns
     * validation error responses in a more UI-friendly formatting.
     *
     * @see FormError from shared lib
     */
    {
      provide: APP_PIPE,
      useFactory: (): ZodDtoValidationPipe => {
        return new ZodDtoValidationPipe({ errorHttpStatusCode: 422 })
      },
    },

    //
    // {
    //   provide: APP_INTERCEPTOR,
    //   useFactory: (): SanitizeResponseInterceptor => {
    //     return new SanitizeResponseInterceptor(['password', 'refreshTokenHash'])
    //   },
    // },

    /**
     * ClassSerializerInterceptor: serializes and transforms instances of dto/entity classes returned as responses.
     * Typically used in conjunction with class-validator + class-transformer.
     */
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector],
      useFactory: (reflector: Reflector): ClassSerializerInterceptor => {
        return new ClassSerializerInterceptor(reflector, {
          strategy: 'exposeAll', // 'excludeAll' is most secure practice for projects without zod for serialization
          excludeExtraneousValues: true,
          enableImplicitConversion: false, // explicitly set false to reinforce rigorous behavior
        })
      },
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   inject: [Reflector],
    //   useFactory: (reflector: Reflector): ZodSerializerInterceptor => {
    //     return new ZodSerializerInterceptor(reflector, {})
    //   },
    // },
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(RequestStartTimeMiddleware, RequestIdMiddleware).forRoutes('*')
  // }
}
