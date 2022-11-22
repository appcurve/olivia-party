import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { Prisma, User } from '@prisma/client'
import type { AppConfig } from '../../config/types/app-config.interface'
import type { AuthConfig } from '../../config/types/auth-config.interface'
import type { SignedToken } from './types/signed-token.interface'
import type { TokenPayload } from './types/token-payload.interface'

import { PrismaService } from '../prisma/prisma.service'
import { PasswordService } from './password.service'
import { isSignedTokenPayload } from './types/type-guards/is-signed-token-payload'
import { RegisterUserApiDto } from './dto/register-user.api-dto'
import { ChangePasswordApiDto } from './dto/change-password.api-dto'
import { SanitizedUserApiDto, SanitizedUserInternalApiDto } from './dto/sanitized-user.api-dto'
import { SanitizedUserDto, SanitizedUserInternalDto } from '@firx/op-data-api'

@Injectable()
export class AuthService {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    SERVER_ERROR: 'Server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    REGISTRATION_FAILED: 'Failed to register user',
    CHANGE_PASSWORD_FAILED: 'Failed to change user password',
    EMAIL_CONFLICT: 'Email already exists',
  }

  private readonly authConfig: AuthConfig

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {
    const authConfig = this.configService.get<AuthConfig>('auth')

    if (!authConfig) {
      throw new Error('AuthModule unable to access auth config')
    }

    this.authConfig = authConfig
  }

  // @see https://github.com/prisma/prisma/issues/5042#issuecomment-1104679760
  // usage: { select: excludeFields(Prisma.UserScalarFieldEnum, ['password']), }
  // excludeFields<T, K extends keyof T>(fields: T, omit: K[]) {
  //   const result: Partial<Record<keyof T, boolean>> = {}
  //   for (const key in fields) {
  //     if (!omit.includes(key as any)) {
  //       result[key] = true
  //     }
  //   }
  //   return result
  // }

  /**
   * Return a new `SanitizedUserApiDto` based on the given Prisma database client `User` except with the
   * sensitive fields including password and refresh token removed.
   *
   * Using this function is important to safeguard against sensitive data being leaked into responses, logs,
   * to undesired third-parties, etc.
   *
   * AuthService functions are called by PassportJS strategies that add the `user` object to the request
   * for authenticated users. The framework itself and the project's web of dependencies cannot be trusted
   * to safeguard sensitive fields now or into the future.
   */
  public getSanitizedUserDto(
    user: User | Omit<User, 'password' | 'refreshToken'> | SanitizedUserInternalDto | SanitizedUserDto,
  ): SanitizedUserDto {
    // explicitly remove sensitive fields as an extra layer of precaution (do not put faith in upstream config/libs)
    const { password: _password, refreshToken: _refreshToken, ...restUser } = user as User

    return SanitizedUserApiDto.create(restUser)
  }

  /**
   * Internal API-only (server-side) version of `getSanitizedUserDto()` that includes the unique `id` field.
   */
  public getSanitizedUserInternalDto(user: User | SanitizedUserInternalDto): SanitizedUserInternalDto {
    return SanitizedUserInternalApiDto.create(user)
  }

  /**
   * Return the appropriate sanitized user DTO depending on 'public' vs. 'internal' context argument.
   */
  private getSanitizedUserResponseDto<T extends 'public' | 'internal'>(
    user: User,
    context: T,
  ): T extends 'public' ? SanitizedUserDto : T extends 'internal' ? SanitizedUserInternalDto : never
  private getSanitizedUserResponseDto(
    user: User,
    context: 'public' | 'internal' = 'public',
  ): SanitizedUserDto | SanitizedUserInternalDto {
    switch (context) {
      case 'internal': {
        return this.getSanitizedUserInternalDto(user)
      }
      case 'public': {
        return this.getSanitizedUserDto(user)
      }
    }
  }

  /**
   * Register (create) a new user or throw an Error on failure.
   *
   * @throws {ConflictException} if given an email that already exists.
   * @throws {InternalServerErrorException} in other cases of failure.
   */
  async registerUser<T extends 'public' | 'internal'>(
    dto: RegisterUserApiDto,
    options?: { context: T },
  ): Promise<T extends 'public' ? SanitizedUserDto : T extends 'internal' ? SanitizedUserInternalDto : never>
  async registerUser(
    dto: RegisterUserApiDto,
    options: { context: 'public' | 'internal' } = { context: 'public' },
  ): Promise<SanitizedUserDto | SanitizedUserInternalDto> {
    const { password, country, locale, timeZone, currency, playerUserName, playerUserYob, ...restDto } = dto
    const passwordHash = await this.passwordService.hash(password)

    try {
      const user = await this.prisma.user.create({
        data: {
          ...restDto,
          password: passwordHash,
          profile: {
            create: {
              bio: undefined,
              playerUserName,
              playerUserYob,
              country,
              locale,
              timeZone,
              currency,
            },
          },
        },
      })

      return this.getSanitizedUserResponseDto(user, options?.context)
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.log(`New user registration email conflict: ${dto.email}`)
          throw new ConflictException(`${this.ERROR_MESSAGES.EMAIL_CONFLICT}: ${dto.email}`)
        }

        this.logger.error(`Prisma database error registering user [${error.code}]: ${error.message}`)
      }

      this.logger.error(String(error))
      throw new InternalServerErrorException(this.ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  /**
   * Change a user's password and clear their refreshToken hash.
   *
   * @throws {UnauthorizedException} if previous/old password fails verification
   * @throws {InternalServerErrorException} in other cases of failure
   */
  async changeUserPassword(email: string, dto: ChangePasswordApiDto): Promise<void> {
    // verify the current credentials - throws UnauthorizedException on failure
    await this.getAuthenticatedUserByCredentials(email, dto.oldPassword)

    const passwordHash = await this.passwordService.hash(dto.newPassword)

    try {
      await this.prisma.user.update({
        data: {
          password: passwordHash,
          refreshToken: null,
        },
        where: {
          email,
        },
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.error(`Failed to change user password - user not found (${error.code}): ${email}`)
      }

      this.logger.error(String(error))
      throw new InternalServerErrorException(this.ERROR_MESSAGES.CHANGE_PASSWORD_FAILED)
    }
  }

  /**
   * Save a user's refresh token hash to the database, as computed from the given signed refresh token.
   */
  async setUserRefreshTokenHash(email: string, signedToken: string): Promise<void> {
    const refreshTokenHash = await this.passwordService.hash(signedToken)

    try {
      await this.prisma.user.update({
        data: {
          refreshToken: refreshTokenHash,
        },
        where: {
          email,
        },
      })
    } catch (error: unknown) {
      throw new InternalServerErrorException(this.ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  /**
   * Reset (set to `null`) a user's refresh token hash in the database.
   */
  async clearUserRefreshToken(email: string): Promise<void> {
    await this.prisma.user.update({
      data: {
        refreshToken: null,
      },
      where: {
        email,
      },
    })
  }

  /**
   * Return the user associated with the given credentials or else throw an Error.
   *
   * @throws {UnauthorizedException} if no user is found or the given credentials are invalid.
   */
  async getAuthenticatedUserByCredentials<T extends 'public' | 'internal'>(
    email: string,
    password: string,
    options?: { context: T },
  ): Promise<T extends 'public' ? SanitizedUserDto : T extends 'internal' ? SanitizedUserInternalDto : never>
  async getAuthenticatedUserByCredentials(
    email: string,
    password: string,
    options: { context: 'public' | 'internal' } = { context: 'public' },
  ): Promise<SanitizedUserDto | SanitizedUserInternalDto> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isValidCredentials = await this.passwordService.verify(user.password, password)

    if (!isValidCredentials) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.getSanitizedUserResponseDto(user, options?.context)
  }

  /**
   * Return the user with the given email address.
   * Applicable to Passport strategies that append the authenticated user to the request object.
   *
   * @throws {UnauthorizedException} if no user is found with the given email
   */
  async getUserByEmail<T extends 'public' | 'internal'>(
    email: string,
    options?: { context: T },
  ): Promise<T extends 'public' ? SanitizedUserDto : T extends 'internal' ? SanitizedUserInternalDto : never>
  async getUserByEmail(
    email: string,
    options: { context: 'public' | 'internal' } = { context: 'public' },
  ): Promise<SanitizedUserDto | SanitizedUserInternalDto> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.getSanitizedUserResponseDto(user, options?.context)
  }

  /**
   * Return the `SanitizedUserInternalDto` corresponding to the given email address and signed refresh token.
   * Applicable to the Passport JWT refresh token strategy.
   *
   * Returns the internal API version of `SanitizedUser` that includes the user's `id` property.
   *
   * @throws {UnauthorizedException} if a user's refresh token is invalid or no user is found with the given email
   */
  async getAuthenticatedUserByRefreshToken<T extends 'public' | 'internal'>(
    email: string,
    signedRefreshToken: string,
    options?: { context: T },
  ): Promise<T extends 'public' ? SanitizedUserDto : T extends 'internal' ? SanitizedUserInternalDto : never>
  async getAuthenticatedUserByRefreshToken(
    email: string,
    signedRefreshToken: string,
    options: { context: 'public' | 'internal' } = { context: 'public' },
  ): Promise<SanitizedUserDto | SanitizedUserInternalDto> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    // throw if the user's record is missing a refresh token hash
    if (!user.refreshToken) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isValidRefreshToken = await this.passwordService.verify(user.refreshToken, signedRefreshToken)

    if (!isValidRefreshToken) {
      throw new UnauthorizedException(this.ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    return this.getSanitizedUserResponseDto(user, options?.context)
  }

  /**
   * Return the user corresponding to the `email` contained in the given JWT payload or else `undefined`.
   * This method may not be necessary if using a PassportJS' JWT strategy to perform this functionality.
   */
  async getUserByAuthenticationToken<T extends 'public' | 'internal'>(
    token: string,
    options?: { context: T },
  ): Promise<T extends 'public' ? SanitizedUserDto : T extends 'internal' ? SanitizedUserInternalDto : never>
  async getUserByAuthenticationToken(
    token: string,
    options: { context: 'public' | 'internal' } = { context: 'public' },
  ): Promise<SanitizedUserDto | SanitizedUserInternalDto | undefined> {
    const authConfig = this.configService.get<AuthConfig>('auth')

    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: authConfig?.jwt.accessToken.secret,
    })

    if (payload.email) {
      const user = await this.prisma.user.findUnique({ where: { email: payload.email } })

      if (user) {
        return this.getSanitizedUserResponseDto(user, options?.context)
      }
    }

    return undefined
  }

  /**
   * Return JWT token payload for the given `SanitizedUser`.
   */
  public createJwtTokenPayload(user: SanitizedUserDto | SanitizedUserInternalDto): TokenPayload {
    return {
      email: user.email,
      name: user.name,
    }
  }

  /**
   * Return a signed JWT authentication token computed vs. the given payload.
   */
  public async signAuthenticationPayload(payload: TokenPayload): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.authConfig.jwt.accessToken.secret,
      expiresIn: `${this.authConfig.jwt.accessToken.expirationTime}s`,
    })

    return token
  }

  /**
   * Return a signed JWT refresh token computed vs. the given payload.
   *
   * Sets the expiry based on the optional "expires in" time in seconds if provided, otherwise the expiry
   * time defaults to the config value set via the environment.
   */
  public async signRefreshPayload(payload: TokenPayload, expiresInSeconds?: number): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.authConfig.jwt.refreshToken.secret,
      expiresIn: `${expiresInSeconds ?? this.authConfig.jwt.refreshToken.expirationTime}s`,
    })

    return token
  }

  /**
   * Return a signed JWT refresh token computed vs. the given payload.
   *
   * Sets the expiry based on the optional "expires in" time in seconds if provided, otherwise the expiry
   * time defaults to the config value obtained from the environment.
   *
   * @throws BadRequestException if there are any issues verifying the token or validating the payload.
   */
  public async verifyRefreshToken(token: string | unknown): Promise<TokenPayload & SignedToken> {
    try {
      if (typeof token !== 'string') {
        throw new Error(`refresh token from request is not a string: ${JSON.stringify(token, null, 2)}`)
      }

      const decoded = await this.jwtService.verifyAsync<TokenPayload & SignedToken>(token, {
        secret: this.authConfig.jwt.refreshToken.secret,
      })

      if (!isSignedTokenPayload(decoded)) {
        throw new Error(`verified refresh token failed object validation: ${JSON.stringify(decoded, null, 2)}`)
      }

      return decoded
    } catch (error: unknown) {
      this.logger.error(error)
      throw new BadRequestException()
    }
  }
}
