import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zRegisterUser } from '@firx/op-data-api'

export const zRegisterUserApiDto = extendApi(zRegisterUser, {
  title: 'Register User',
  description: 'Register a new user',
})

export class RegisterUserApiDto extends createZodDto(zRegisterUserApiDto) {}
