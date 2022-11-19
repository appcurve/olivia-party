import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'

import type { SanitizedUserInternalDto } from '@firx/op-data-api'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',

      // option to pass request object as first argument to the validate() callback
      passReqToCallback: false,
    })
  }

  /**
   * Given email and password credentials, return the user associated with the email + password tuple,
   * or else throw an `UnauthorizedException`.
   *
   * The user returned by this method is added to the request object of any controller method decorated
   * with the appropriate guard e.g. `LocalAuthGuard`.
   */
  async validate(email: string, password: string): Promise<SanitizedUserInternalDto> {
    this.logger.log(`User sign-in request: ${email}`)

    try {
      const user = await this.authService.getAuthenticatedUserByCredentials(email, password, { context: 'internal' })

      return user
    } catch (error) {
      this.logger.warn(`User sign-in authentication error (email/password): ${email}`)
      throw new UnauthorizedException('Authorization failed')
    }
  }
}
