import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'

import { AuthService } from '../auth.service'
import type { TokenPayload } from '../types/token-payload.interface'
import type { AuthConfig } from '../../../config/types/auth-config.interface'
import type { SanitizedUserInternalDto } from '@firx/op-data-api'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    const secretOrKey = configService.get<AuthConfig>('auth')?.jwt.refreshToken.secret

    if (!secretOrKey) {
      throw new InternalServerErrorException('Authentication error') // better safe than sorry
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          // cookies are added to request object via cookie-parser (refer to main.ts for configuration)
          // note: if using unsigned cookies use request?.cookies?.Refresh
          return request?.signedCookies?.Refresh ?? null
        },
      ]),
      secretOrKey,
      ignoreExpiration: false,

      // pass request object to `validate()` so it can access { signedCookies, cookies } of the request
      passReqToCallback: true,
    })
  }

  /**
   * Validate user's refresh token via the AuthService.
   */
  async validate(request: Request, payload: TokenPayload): Promise<SanitizedUserInternalDto> {
    this.logger.log(`User refresh token validation request: ${payload.email}`)
    const refreshTokenFromRequest = request.signedCookies?.Refresh

    if (refreshTokenFromRequest === false) {
      this.logger.warn(`Signed refresh token cookie was tempered with per cookie-parser`)
      throw new UnauthorizedException()
    }

    const user = await this.authService.getAuthenticatedUserByRefreshToken(payload.email, refreshTokenFromRequest, {
      context: 'internal',
    })

    return user
  }
}
