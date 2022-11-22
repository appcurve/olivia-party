import { z } from 'zod'
import { VideoPlatform as VideoPlatformEnum } from '@prisma/client'
import { zBaseResponseDto, zBaseEntity, zApiDto } from '../../common'
import { DataQueryParams } from '../../../../types/data-query-params.interface'
import { zDate } from '../../../zod/z-dates'

/** Export VideoPlatform enum: Prisma schema serves as SSOT */
export const VideoPlatform = VideoPlatformEnum

/** Record that maps `VideoPlatform` const enum values to UI-friendly display names. */
export const VideoPlatformDisplayName: Record<keyof typeof VideoPlatform, string> = {
  YOUTUBE: 'YouTube',
} as const

/** Core model + DTO fields of Video */
export const zVideo = z.object({
  name: z.string(),
  platform: z.nativeEnum(VideoPlatform),
  externalId: z.string(),
})

export const zVideoPlaylist = z.object({
  name: z.string(),
  enabledAt: zDate.nullish(),
})

/** Model relation fields of Video. */
export const zVideoRelationFields = z.object({
  playerId: z.number().int(),
})

/** Model fields of a Video in the database schema. */
export const zVideoFields = zBaseEntity.merge(zVideo).merge(zVideoRelationFields)

export const zVideoDto = zVideo
  .extend({
    // @see opposite relation in definition of zVideoPlaylistDto. if the Dto's themselves were to reference each other
    // it will create a circular reference (see zod.lazy() if this becomes a requirement for possible resolution)
    playlists: zApiDto.merge(zVideoPlaylist).array(),
  })
  .merge(zBaseResponseDto)

export const zCreateVideoDto = zVideo.extend({
  playlists: z.string().uuid().array(),
})

export const zUpdateVideoDto = zCreateVideoDto.partial()

export interface VideoDto extends z.infer<typeof zVideoDto> {}
export interface CreateVideoDto extends z.infer<typeof zCreateVideoDto> {}
export interface UpdateVideoDto extends z.infer<typeof zUpdateVideoDto> {}

export type VideoDataParams = DataQueryParams<VideoDto, 'name' | 'platform', never>

export const zVideoPlaylistRelationFields = z.object({
  playerId: z.number().int(),
})

export const zVideoPlaylistFields = zBaseEntity.merge(zVideoPlaylist).merge(zVideoPlaylistRelationFields)

export const zVideoPlaylistDto = zVideoPlaylist
  .extend({
    // @see opposite relation in definition of zVideoDto. if the Dto's themselves were to reference each other
    // it will create a circular reference (see zod.lazy() if this becomes a requirement for possible resolution)
    videos: zApiDto.merge(zVideo).array(),
  })
  .merge(zBaseResponseDto)

export const zCreateVideoPlaylistDto = zVideoPlaylist.omit({ enabledAt: true }).extend({
  enabled: z.boolean().optional(),
  videos: z.array(z.string().uuid()).optional(),
})

export const zUpdateVideoPlaylistDto = zCreateVideoPlaylistDto.partial()

export interface VideoPlaylistDto extends z.infer<typeof zVideoPlaylistDto> {}
export interface CreateVideoPlaylistDto extends z.infer<typeof zCreateVideoPlaylistDto> {}
export interface UpdateVideoPlaylistDto extends z.infer<typeof zUpdateVideoPlaylistDto> {}

export type VideoPlaylistDataParams = DataQueryParams<VideoPlaylistDto, 'name', never>

/** Zod schema reflecting the many-to-many join table for Video Playlists on Videos. */
export const zVideoPlaylistsOnVideosFields = z.object({
  videoId: z.number().int(),
  videoPlaylistId: z.number().int(),
})
