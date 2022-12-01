import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zCreateUserDto } from '@firx/op-data-api'

export const zRegisterUserApiDto = extendApi(zCreateUserDto, {
  title: 'Register User',
  description: 'Register a new user',
})

export class RegisterUserApiDto extends createZodDto(zRegisterUserApiDto) {}
