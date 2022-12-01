import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zUserPublicDto, zUserInternalDto } from '@firx/op-data-api'

export const zUserPublicApiDto = extendApi(zUserPublicDto, {
  title: 'User (Sanitized - Public)',
  description: 'User with sensitive credentials fields and unique interger id omitted.',
})

export const zUserInternalApiDto = extendApi(zUserInternalDto, {
  title: 'User (Sanitized - Internal API)',
  description: 'User with sensitive credentials fields omitted.',
})

/**
 * Public-facing User DTO class that omits users' unique `id` and sensitive credentials fields.
 */
export class UserPublicApiDto extends createZodDto(zUserPublicApiDto) {}

/**
 * Internal API-only version of user DTO class that includes users' unique `id` and omits sensitive credentials fields.
 */
export class UserInternalApiDto extends createZodDto(zUserInternalApiDto) {}
