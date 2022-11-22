import { User } from '@prisma/client'

/**
 * Convenience type representing an authenticated user with basic identifiers (id, uuid, email)
 * suitable for cases where only these properties are required.
 *
 * @see SanitizedUserDto
 * @see SanitizedUserInternalDto
 */
export type AuthUser = Pick<User, 'id' | 'uuid' | 'email'>
