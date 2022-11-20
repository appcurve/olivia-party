import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

import { zCreateVideoPlaylistDto, zUpdateVideoPlaylistDto, zVideoPlaylistDto } from '@firx/op-data-api'

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

export const zUpdateVideoApiDto = extendApi(zUpdateVideoPlaylistDto, {
  title: 'OP-App - Video Player - Update Video',
  description: '',
})
export class UpdateVideoPlaylistApiDto extends createZodDto(zUpdateVideoApiDto) {}
