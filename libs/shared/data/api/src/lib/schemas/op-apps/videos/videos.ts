import { z } from 'zod'
import { VideoPlatform } from '@prisma/client'
import { zBaseResponseDto, zBaseEntity } from '../../common'
import { zVideoPlaylistDto } from './playlists'
import { DataQueryParams } from '../../../../types/data-query-params.interface'

/** Core model + DTO fields of Video */
export const zVideo = z.object({
  name: z.string(),
  platform: z.nativeEnum(VideoPlatform),
  externalId: z.string(),
})

/** Model relation fields of Video. */
export const zVideoRelationFields = z.object({
  playerId: z.number().int(),
})

/** Model fields of a Video in the database schema. */
export const zVideoFields = zBaseEntity.merge(zVideo).merge(zVideoRelationFields)

export const zVideoDto = zVideo
  .extend({
    playlists: zVideoPlaylistDto.array(),
  })
  .merge(zBaseResponseDto)

export const zCreateVideoDto = zVideo.extend({
  playlists: z.string().uuid().array().nullish(),
})

export const zUpdateVideoDto = zCreateVideoDto.partial()

export interface VideoDto extends z.infer<typeof zVideoDto> {}
export interface CreateVideoDto extends z.infer<typeof zCreateVideoDto> {}
export interface UpdateVideoDto extends z.infer<typeof zUpdateVideoDto> {}

export type VideoDataParams = DataQueryParams<VideoDto, 'name' | 'platform', never>
