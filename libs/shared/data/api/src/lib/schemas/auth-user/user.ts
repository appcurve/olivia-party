import { z } from 'zod'
import { zDate } from '../../zod/z-dates'
import { zBaseEntity } from '../common'
import { zUserProfileDto, zUserProfileFields } from './user-profile'

// import type { User } from '@prisma/client'

export type UserDto = UserPublicDto

export interface UserPublicDto extends z.infer<typeof zUserPublicDto> {}
export interface UserInternalDto extends z.infer<typeof zUserInternalDto> {}

export interface CreateUserDto extends z.infer<typeof zCreateUserDto> {}
// export interface UpdateUserDto extends z.infer<typeof zCreateUser> {} // @todo TBD user updates

export const zUserDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export const zUserSensitiveDto = zBaseEntity.merge(
  zUserDto.extend({
    verifiedAt: zDate.nullable(),
    password: z.string(),
    refreshToken: z.string(),
  }),
)

export const zUserSensitiveWithRelationsDto = z.lazy(() =>
  zUserSensitiveDto.extend({
    profile: zUserProfileDto.nullish(),

    // app: RelatedAppProfileModel.nullish(),
    // boxProfiles: RelatedBoxProfileModel.array(),
  }),
)

export const zUserInternalDto = zUserSensitiveDto.pick({
  id: true,
  uuid: true,
  name: true,
  email: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
})

export const zUserPublicDto = zUserInternalDto.omit({ id: true })

export const zSanitizedUserFieldsWithRelations = z.lazy(() =>
  zUserPublicDto.extend({
    profile: zUserProfileDto.nullish(),

    // app: RelatedAppProfileModel.nullish(),
    // boxProfiles: RelatedBoxProfileModel.array(),
  }),
)

export const zCreateUserDto = zUserSensitiveDto
  .pick({ name: true, email: true, password: true })
  .merge(zUserProfileFields)
