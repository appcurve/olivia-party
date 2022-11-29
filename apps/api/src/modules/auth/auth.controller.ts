import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import type { CookieOptions, Response } from 'express'
import { ConfigService } from '@nestjs/config'

import type { AuthConfig } from '../../config/types/auth-config.interface'
import type { AppConfig } from '../../config/types/app-config.interface'
import type { AuthenticatedRequest } from './types/authenticated-request.interface'

import { AuthUser } from './decorators/auth-user.decorator'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { ApiTags } from '@nestjs/swagger'
import { RegisterUserApiDto } from './dto/register-user.api-dto'
import { ChangePasswordApiDto } from './dto/change-password.api-dto'
import { SanitizedUserApiDto } from './dto/sanitized-user.api-dto'
import { SanitizedUserDto } from '@firx/op-data-api'

const CONTROLLER_NAME = 'auth'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
export class AuthController {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    INVALID_CHANGE_PASSWORD_MATCH: 'New password cannot be the same as the old password',
  }

  private readonly authConfig: AuthConfig

  constructor(private readonly configService: ConfigService<AppConfig>, private readonly authService: AuthService) {
    const authConfig = this.configService.get<AuthConfig>('auth')

    if (!authConfig) {
      throw new Error('AuthModule unable to access auth config')
    }

    this.authConfig = authConfig
  }

  /**
   * Helper that returns an Express `CookieOptions` object with configuration for
   * authentication + refresh cookies.
   *
   * The returned options specify a signed `HTTPOnly` + `SameSite` cookie, with the `Secure`
   * flag added for production environments. These options help protect the auth + refresh
   * tokens and provide a measure of protection against CSRF/XSRF attacks.
   *
   * Take care to ensure that a totally unique
   *
   * No `domain` is specified to ensure the cookie's scope is restricted to the issuing domain
   * (the default behavior) as a security consideration.
   *
   * The function accepts an argument for the cookie lifetime in seconds relative to now.
   * It performs an internal conversion to the _milliseconds from `Date.now()`_ unit required
   * by Express.
   */
  private getCookieOptions(expiresInSeconds: number): CookieOptions {
    return {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
      signed: true,
      maxAge: expiresInSeconds * 1000,
    }
  }

  /**
   * Helper to set sign out cookies on the given Express `Response` object.
   */
  private setSignOutCookies(response: Response): void {
    response.clearCookie('Authentication', this.getCookieOptions(0))
    response.clearCookie('Refresh', this.getCookieOptions(0))
  }

  /**
   * Helper to set signed Authentication + Refresh token cookies on the given Express
   * `Response` object.
   *
   * If `expiresInSeconds` is not provided for a given cookie the config value obtained from
   * the environment for that cookie will be used.
   */
  private setCredentialsCookies(
    response: Response,
    config: {
      authentication: {
        signedTokenPayload: string
        expiresInSeconds?: number
      }
      refresh: {
        signedTokenPayload: string
        expiresInSeconds?: number
      }
    },
  ): void {
    const { authentication, refresh } = config

    response.cookie(
      'Authentication',
      authentication.signedTokenPayload,
      this.getCookieOptions(authentication.expiresInSeconds ?? this.authConfig.jwt.accessToken.expirationTime),
    )

    response.cookie(
      'Refresh',
      refresh.signedTokenPayload,
      this.getCookieOptions(refresh.expiresInSeconds ?? this.authConfig.jwt.refreshToken.expirationTime),
    )
  }

  @Post('register')
  async register(@Body() dto: RegisterUserApiDto): Promise<SanitizedUserApiDto> {
    // @todo restrict, user verification, etc
    this.logger.log(`User registration request: ${dto.email}`)

    const user = await this.authService.registerUser(dto)
    return SanitizedUserApiDto.create(user)
  }

  @Post('change-password')
  async changePassword(
    @AuthUser() user: SanitizedUserDto,
    @Body() dto: ChangePasswordApiDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    this.logger.log(`User change password request: ${user.email}`)

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(this.ERROR_MESSAGES.INVALID_CHANGE_PASSWORD_MATCH)
    }

    this.setSignOutCookies(response)
    return this.authService.changeUserPassword(user.email, dto)
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // override default 201
  async signIn(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SanitizedUserDto> {
    const { user } = request
    this.logger.log(`User sign-in request: ${user.email} <${user.id}> <${user.uuid}> <${user.name}>`)

    const {
      signedTokens: { authentication, refresh },
    } = await this.authService.signUserJwtTokens(user)

    this.setCredentialsCookies(response, {
      authentication: {
        signedTokenPayload: authentication,
        expiresInSeconds: this.authConfig.jwt.accessToken.expirationTime,
      },
      refresh: {
        signedTokenPayload: refresh,
        expiresInSeconds: this.authConfig.jwt.refreshToken.expirationTime,
      },
    })

    return this.authService.getSanitizedUserDto(user)
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  session(@Req() request: AuthenticatedRequest): SanitizedUserApiDto {
    this.logger.debug(`User fetch session: ${request.user.email}`)

    // safeguard/smoke-check to protect against leaks in case of a regression bug that exposes credentials
    if ('password' in request.user || 'refreshToken' in request.user) {
      throw new InternalServerErrorException()
    }

    return SanitizedUserApiDto.create(request.user)
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response): Promise<void> {
    const { email } = request.user
    this.logger.log(`User sign-out: ${email}`)

    await this.authService.clearUserRefreshToken(email)
    this.setSignOutCookies(response)
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    /*
    the expended refresh token payload is verified + decoded to implement this security recommendation:
    https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-05#section-8

    requirement:  when issuing a rotated refresh token it MUST NOT extend the lifetime past
                  that of initial refresh token expiry

    - `exp` claim of a signed jsonwebtoken is NumericDate format i.e. seconds since unix epoch
      - https://www.npmjs.com/package/jsonwebtoken#token-expiration-exp-claim
    - `maxAge` of express CookieOptions is specified in milliseconds relative to now
    */

    // @future consider SameSite as env file setting (options: 'lax' | 'strict' | 'none'; `true` === 'strict')
    // http://expressjs.com/en/resources/middleware/cookie-session.html

    this.logger.log(`Auth refresh token request by user: ${request.user.email}`)

    try {
      const {
        signedTokens: { authentication, refresh },
        refreshTokenExpiresInSeconds,
      } = await this.authService.verifyRefreshAndReissueJwtTokens(request.user, request.signedCookies?.Refresh)

      this.setCredentialsCookies(response, {
        authentication: {
          signedTokenPayload: authentication,
        },
        refresh: {
          signedTokenPayload: refresh,
          expiresInSeconds: refreshTokenExpiresInSeconds,
        },
      })
    } catch (error: unknown) {
      this.logger.error(
        `Error refreshing token (${error instanceof Error ? error.name : 'unknown'})`,
        (error instanceof Error && error.stack) || undefined,
      )
      throw new UnauthorizedException()
    }
  }
}
