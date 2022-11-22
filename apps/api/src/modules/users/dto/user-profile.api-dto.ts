import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zUserProfile } from '@firx/op-data-api'

export const zUserProfileApiDto = extendApi(zUserProfile, {
  title: 'Update User Profile',
  description: "Update a user's profile",
})

export class UserProfileApiDto extends createZodDto(zUserProfileApiDto) {}
