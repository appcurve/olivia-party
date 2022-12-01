import { Request } from 'express'
import type { UserInternalDto } from '@firx/op-data-api'

/**
 * Interface of an express `Request` object extended with the authenticated user added as property `user`.
 *
 * The `user` object will be added to requests by PassportJS strateg(ies) following successful authentication.
 * Adding an authenticated `user` to the `request` object is a common pattern in the NodeJS ecosystem.
 *
 * For most use-cases, such as a controller method, use the `AuthUser()` decorator exported from the AuthModule
 * to access the user object on an authenticated request.
 *
 * The user object has the interface `SanitizedUserInternalDto` which omits security-sensitive data such as
 * the password hash, however it also contains the user's `id` property which should not be sent to clients
 * per project conventions.
 *
 * Usage:
 *
 * ```ts
 * async signOut(@Req() request: AuthenticatedRequest) ...
 * ```
 *
 * @see AuthUser
 */
export interface AuthenticatedRequest extends Request {
  user: UserInternalDto
}
