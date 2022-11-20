import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

import { zCreateVideoDto, zUpdateVideoDto, zVideoDto } from '@firx/op-data-api'

export const zVideoApiDto = extendApi(zVideoDto, {
  title: 'OP-App - Video Player - Video',
  description:
    'A video from a supported streaming platform e.g. YouTube that can be played via the Video Player OP-App',
})
export class VideoApiDto extends createZodDto(zVideoApiDto) {}

export const zCreateVideoApiDto = extendApi(zCreateVideoDto, {
  title: 'OP-App - Video Player - Add/Create Video',
  description: '',
})
export class CreateVideoApiDto extends createZodDto(zCreateVideoApiDto) {}

export const zUpdateVideoApiDto = extendApi(zUpdateVideoDto, {
  title: 'OP-App - Video Player - Update Video',
  description: '',
})
export class UpdateVideoApiDto extends createZodDto(zUpdateVideoApiDto) {}
