import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zCreateUser } from '@firx/op-data-api'

export const zRegisterUserApiDto = extendApi(zCreateUser, {
  title: 'Register User',
  description: 'Register a new user',
})

export class RegisterUserApiDto extends createZodDto(zRegisterUserApiDto) {}
