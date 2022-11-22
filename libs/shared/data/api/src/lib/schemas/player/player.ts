import { z } from 'zod'
import { zBaseResponseDto } from '../common'

// cardinality: users can have many players (aka "player profiles")
// originally named 'BoxProfile'

/** Core model + DTO fields of a Player profile. */
export const zPlayer = z.object({
  name: z.string(),
  urlCode: z.string(),
})

// previous - with lots of data @future only need to provide high-level stats with player response
// export const zPlayerDto = zPlayer
//   .extend({
//     videos: zVideoDto.array(),
//     videoPlaylists: zVideoPlaylistDto.array(),
//   })
//   .merge(zBaseResponseDto)

// revised - simplified for now @future add stats to PlayerDto
export const zPlayerDto = zPlayer.merge(zBaseResponseDto)

export const zCreatePlayerDto = zPlayerDto.pick({ name: true })
export const zUpdatePlayerDto = zPlayerDto.partial()

export interface PlayerDto extends z.infer<typeof zPlayerDto> {}
export interface CreatePlayerDto extends z.infer<typeof zCreatePlayerDto> {}
export interface UpdatePlayerDto extends z.infer<typeof zUpdatePlayerDto> {}

/**
 * API query context required for data queries of children of a given Player.
 * @see ApiParentContext
 */
export type PlayerChildQueryContext = {
  playerUuid: string
}
