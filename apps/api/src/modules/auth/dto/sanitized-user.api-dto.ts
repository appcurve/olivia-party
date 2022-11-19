import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zSanitizedUser, zSanitizedUserInternal } from '@firx/op-data-api'

export const zSanitizedUserApiDto = extendApi(zSanitizedUser, {
  title: 'User (Sanitized)',
  description: 'User with sensitive fields omitted.',
})

/** Internal API/back-end only version of SanitizedUserApiDto class that includes the `id` unique identifier.  */
export class SanitizedUserInternalApiDto extends createZodDto(zSanitizedUserInternal) {}

/** Public-facing User DTO class that omits sensitive fields. */
export class SanitizedUserApiDto extends createZodDto(zSanitizedUserApiDto) {}
