import { ApiDataObject } from './api.types'

export enum VideoPlatform {
  YOUTUBE = 'YOUTUBE',
  // VIMEO = 'VIMEO',
}

export const VideoPlatformDisplayName: Record<VideoPlatform, string> = {
  YOUTUBE: 'YouTube',
} as const

export interface VideoDto extends ApiDataObject {
  name: string
  platform: VideoPlatform
  externalId: string
  createdAt: Date
  updatedAt: Date
  groups: VideoGroupDto[]
}

export interface CreateVideoDto extends Pick<VideoDto, 'name' | 'platform' | 'externalId'> {
  groups?: VideoDto['groups'][number]['uuid'][]
}

export interface UpdateVideoDto extends Partial<CreateVideoDto> {}

// @todo handle dates response on ui
export interface VideoGroupDto extends ApiDataObject {
  createdAt: Date
  updatedAt: Date
  enabledAt: Date | null
  name: string
  videos: VideoDto[]
}

export interface CreateVideoGroupDto extends Pick<VideoGroupDto, 'name'> {
  enabled?: boolean
  videos?: VideoGroupDto['videos'][number]['uuid'][]
}

export interface UpdateVideoGroupDto extends Partial<CreateVideoGroupDto> {}
