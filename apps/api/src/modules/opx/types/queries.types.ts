import { VideoGroupModelResponseDto, VideoModelResponseDto } from './response.types'

export type VideoModelPrismaSelectFields = Record<keyof VideoModelResponseDto, true>
export type VideoPlaylistModelPrismaSelectFields = Record<keyof VideoGroupModelResponseDto, true>

export type VideoPrismaSelectClause = VideoModelPrismaSelectFields & {
  playlists: { select: { videoPlaylist: { select: VideoPlaylistModelPrismaSelectFields } } }
}
export type VideoPlaylistPrismaSelectClause = VideoPlaylistModelPrismaSelectFields & {
  videos: { select: { video: { select: VideoModelPrismaSelectFields } } }
}

export type PrismaVideoQueryResult = VideoModelResponseDto & {
  playlists: { videoPlaylist: VideoGroupModelResponseDto }[]
}
export type PrismaVideoPlaylistQueryResult = VideoGroupModelResponseDto & { videos: { video: VideoModelResponseDto }[] }
