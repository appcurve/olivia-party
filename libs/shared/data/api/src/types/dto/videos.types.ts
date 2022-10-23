import type { ApiDataObject } from './api.types'
import type { Video, VideoGroup } from '@prisma/client'
import type { DataQueryParams } from '../data-query-params.interface'

export enum VideoPlatform {
  YOUTUBE = 'YOUTUBE',
  // VIMEO = 'VIMEO',
}

export const VideoPlatformDisplayName: Record<VideoPlatform, string> = {
  YOUTUBE: 'YouTube',
} as const

export interface VideoDto
  extends ApiDataObject,
    Pick<Video, 'uuid' | 'createdAt' | 'updatedAt' | 'name' | 'platform' | 'externalId'> {
  groups: VideoGroupDto[]
}

export type VideoDataParams = DataQueryParams<VideoDto, 'name' | 'platform', never>

export interface CreateVideoDto extends Pick<VideoDto, 'name' | 'platform' | 'externalId'> {
  groups?: VideoDto['groups'][number]['uuid'][]
}

export interface UpdateVideoDto extends Partial<CreateVideoDto> {}

export interface VideoGroupDto
  extends ApiDataObject,
    Pick<VideoGroup, 'uuid' | 'createdAt' | 'updatedAt' | 'enabledAt' | 'name'> {
  videos: VideoDto[]
}

export type VideoGroupDataParams = DataQueryParams<VideoGroupDto, 'name', never>

export interface CreateVideoGroupDto extends Pick<VideoGroupDto, 'name'> {
  enabled?: boolean
  videos?: VideoGroupDto['videos'][number]['uuid'][]
}

export interface UpdateVideoGroupDto extends Partial<CreateVideoGroupDto> {}
