import { BoxProfile } from '@prisma/client'
import type { ApiDataObject } from './api.types'
import type { VideoDto, VideoGroupDto } from './videos.types'

export interface BoxProfileDto
  extends ApiDataObject,
    Pick<BoxProfile, 'uuid' | 'name' | 'urlCode' | 'createdAt' | 'updatedAt'> {
  videos: VideoDto[]
  videoGroups: VideoGroupDto[]
}

export interface CreateBoxProfileDto extends Pick<BoxProfileDto, 'name'> {}

export interface MutateBoxProfileDto extends Partial<CreateBoxProfileDto> {}

// export type BoxProfile = Pick<BoxProfileDto, 'uuid' | 'name' | 'urlCode'>

/**
 * API query context required for data queries of children of a given Box Profile.
 *
 * @see ApiParentContext
 */
export type BoxProfileChildQueryContext = {
  boxProfileUuid: string
}
