import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

import { zCreatePlayerDto, zPlayerDto, zUpdatePlayerDto } from '@firx/op-data-api'

export const zPlayerApiDto = extendApi(zPlayerDto, {
  title: 'OliviaParty Player',
  description: 'Profile of an OliviaParty Player associated with a given User.',
})
export class PlayerApiDto extends createZodDto(zPlayerApiDto) {}

export const zCreatePlayerApiDto = extendApi(zCreatePlayerDto, {
  title: 'OliviaParty Player - Create Player Profile',
  description: '',
})
export class CreatePlayerApiDto extends createZodDto(zCreatePlayerApiDto) {}

export const zUpdatePlayerApiDto = extendApi(zUpdatePlayerDto, {
  title: 'OliviaParty Player - Update Player Profile',
  description: '',
})
export class UpdatePlayerApiDto extends createZodDto(zUpdatePlayerApiDto) {}
