import { z } from 'zod'

/**
 * Schema reflecting the many-to-many join table of Video Playlists on Videos.
 */
export const zVideoPlaylistsOnVideosFields = z.object({
  videoId: z.number().int(),
  videoGroupId: z.number().int(),
})
