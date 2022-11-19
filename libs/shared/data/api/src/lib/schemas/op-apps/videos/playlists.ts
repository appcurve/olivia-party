import { z } from 'zod'
import { zDate } from '../../../zod/z-dates'
import { zBaseEntity, zBaseResponseDto } from '../../common'
import { zVideo } from './videos'

export const zVideoPlaylist = z.object({
  name: z.string(),
  enabledAt: zDate,
})

export const zVideoPlaylistRelationFields = z.object({
  boxProfileId: z.number().int(),
})

export const zVideoPlaylistFields = zBaseEntity.merge(zVideoPlaylist).merge(zVideoPlaylistRelationFields)

export const zVideoPlaylistDto = zVideoPlaylist
  .extend({
    videos: zVideo.array(),
  })
  .merge(zBaseResponseDto)

export const zCreateVideoPlaylistDto = zVideoPlaylist.omit({ enabledAt: true }).extend({
  enabled: z.boolean().optional(),
  videos: z.string().uuid().array().nullish(),
})

export const zUpdateVideoPlaylistDto = zCreateVideoPlaylistDto.partial()

export interface VideoPlaylistDto extends z.infer<typeof zVideoPlaylistDto> {}
export interface CreateVideoPlaylistDto extends z.infer<typeof zCreateVideoPlaylistDto> {}
export interface UpdateVideoPlaylistDto extends z.infer<typeof zUpdateVideoPlaylistDto> {}
