import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zUserProfile } from '@firx/op-data-api'

export const zUpdateUserProfileApiDto = extendApi(zUserProfile, {
  title: 'Update User Profile',
  description: "Update a user's profile",
})

export class UpdateUserProfileApiDto extends createZodDto(zUpdateUserProfileApiDto) {}
