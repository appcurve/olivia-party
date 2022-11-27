import { z } from 'zod'
import { User } from '@prisma/client'
import { zDate } from '../../zod/z-dates'
import { zBaseEntity } from '../common'
import { zUserProfile, zUserProfileFields } from './user-profile'

export interface UserDto extends Pick<User, 'email' | 'name'> {}

export const zUserFields_Sensitive = zBaseEntity.merge(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    verifiedAt: zDate.nullable(),
    password: z.string(),
    refreshToken: z.string(),
  }),
)

export const zUserFieldsWithRelations = z.lazy(() =>
  zUserFields_Sensitive.extend({
    profile: zUserProfile.nullish(),
    // app: RelatedAppProfileModel.nullish(),
    // boxProfiles: RelatedBoxProfileModel.array(),
  }),
)

export const zSanitizedUserInternal = zUserFields_Sensitive.pick({
  id: true,
  uuid: true,
  name: true,
  email: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
})

export const zSanitizedUser = zUserFields_Sensitive.pick({
  uuid: true,
  name: true,
  email: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
})

export const zSanitizedUserFieldsWithRelations = z.lazy(() =>
  zSanitizedUser.extend({
    profile: zUserProfile.nullish(),
    // app: RelatedAppProfileModel.nullish(),
    // boxProfiles: RelatedBoxProfileModel.array(),
  }),
)

export const zCreateUser = zUserFields_Sensitive
  .pick({ name: true, email: true, password: true })
  .merge(zUserProfileFields)

export interface SanitizedUserInternalDto extends z.infer<typeof zSanitizedUserInternal> {}

export interface SanitizedUserDto extends z.infer<typeof zSanitizedUser> {}

export interface CreateUserDto extends z.infer<typeof zCreateUser> {}
// export interface UpdateUserDto extends z.infer<typeof zCreateUser> {} // @todo TBD user updates
