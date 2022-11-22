import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

import { zGenericPlayerAppsDto } from '@firx/op-data-api'

export const zGenericAppsApiDto = extendApi(zGenericPlayerAppsDto, {
  title: 'OliviaParty Player App Data',
  description: 'OP-Apps data associated with a given OliviaParty player profile (Player) belonging to a given User',
})
export class PlayerAppsApiDto extends createZodDto(zGenericAppsApiDto) {}
