import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zChangePasswordDto } from '@firx/op-data-api'

export const zChangePasswordApiDto = extendApi(zChangePasswordDto, {
  title: 'Change Password',
  description: 'Change login password of an authenticated user.',
})

export class ChangePasswordApiDto extends createZodDto(zChangePasswordApiDto) {}
