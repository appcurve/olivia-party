import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

import {
  zCreateVideoDto,
  zUpdateVideoDto,
  zVideoDto,
  zCreateVideoPlaylistDto,
  zUpdateVideoPlaylistDto,
  zVideoPlaylistDto,
} from '@firx/op-data-api'

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

export const zVideoPlaylistApiDto = extendApi(zVideoPlaylistDto, {
  title: 'OP-App - Speech/VideoPlaylist - VideoPlaylist List',
  description: 'List of VideoPlaylists that can be spoken using text-to-speech via the Speech (VideoPlaylist) OP-App',
})
export class VideoPlaylistListApiDto extends createZodDto(zVideoPlaylistApiDto) {}

export const zCreateVideoPlaylistApiDto = extendApi(zCreateVideoPlaylistDto, {
  title: 'OP-App - Video Player - Add/Create Video',
  description: '',
})
export class CreateVideoPlaylistApiDto extends createZodDto(zCreateVideoPlaylistApiDto) {}

export const zUpdateVideoPlaylistApiDto = extendApi(zUpdateVideoPlaylistDto, {
  title: 'OP-App - Video Player - Update Video',
  description: '',
})
export class UpdateVideoPlaylistApiDto extends createZodDto(zUpdateVideoPlaylistApiDto) {}
