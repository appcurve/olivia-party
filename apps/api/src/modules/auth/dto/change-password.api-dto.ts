import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zChangePassword } from '@firx/op-data-api'

export const zChangePasswordApiDto = extendApi(zChangePassword, {
  title: 'Change Password',
  description: 'Change login password of an authenticated user.',
})

export class ChangePasswordApiDto extends createZodDto(zChangePasswordApiDto) {}
