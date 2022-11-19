import { z } from 'zod'
import { zBaseResponseDto } from './common'
import { zVideoPlaylistDto } from './op-apps/videos/playlists'
import { zVideoDto } from './op-apps/videos/videos'

// @see Prisma BoxProfile
// cardinality: users have many player profiles

/** Core model + DTO fields of a Player Profile. */
export const zPlayerProfile = z.object({
  name: z.string(),
  urlCode: z.string(),
})

export const zPlayerProfileDto = zPlayerProfile
  .extend({
    videos: zVideoDto.array(),
    videoPlaylists: zVideoPlaylistDto.array(),
  })
  .merge(zBaseResponseDto)

export const zCreatePlayerProfileDto = zPlayerProfileDto.pick({ name: true })
export const zUpdatePlayerProfileDto = zPlayerProfileDto.partial()

export interface PlayerProfileDto extends z.infer<typeof zPlayerProfileDto> {}
export interface CreatePlayerProfileDto extends z.infer<typeof zCreatePlayerProfileDto> {}
export interface UpdatePlayerProfileDto extends z.infer<typeof zUpdatePlayerProfileDto> {}

/**
 * API query context required for data queries of children of a given Player Profile.
 * @see ApiParentContext
 */
export type PlayerProfileChildQueryContext = {
  playerProfileUuid: string
}
