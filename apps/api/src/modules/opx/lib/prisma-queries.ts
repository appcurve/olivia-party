import { Prisma } from '@prisma/client'
import { VIDEO_MODEL_PUBLIC_FIELDS } from '../constants/video-model-public-fields.const'
import { VIDEO_GROUP_MODEL_PUBLIC_FIELDS } from '../constants/video-group-model-public-fields.const'
import type {
  VideoModelPrismaSelectFields,
  VideoPlaylistModelPrismaSelectFields,
  VideoPlaylistPrismaSelectClause,
  VideoPrismaSelectClause,
} from '../types/queries.types'

export const videoPrismaSelectFields: VideoModelPrismaSelectFields = Prisma.validator<Prisma.VideoSelect>()(
  VIDEO_MODEL_PUBLIC_FIELDS.reduce((acc, fieldName) => {
    return {
      ...acc,
      [fieldName]: true,
    }
  }, {} as VideoModelPrismaSelectFields),
)

export const videoPlaylistPrismaSelectFields: VideoPlaylistModelPrismaSelectFields =
  Prisma.validator<Prisma.VideoPlaylistSelect>()(
    VIDEO_GROUP_MODEL_PUBLIC_FIELDS.reduce(
      (acc, fieldName) => ({ ...acc, [fieldName]: true }),
      {} as VideoPlaylistModelPrismaSelectFields,
    ),
  )

export const videoDtoPrismaSelectClause: VideoPrismaSelectClause = {
  ...videoPrismaSelectFields,
  playlists: { select: { videoPlaylist: { select: videoPlaylistPrismaSelectFields } } }, // not sure if its videoPlaylist or playlist on inner one
}

// note: array syntax e.g. groupBy: [{ name: 'asc' }] is also valid with prisma
export const videoDtoPrismaOrderByClause = Prisma.validator<Prisma.VideoOrderByWithAggregationInput>()({ name: 'asc' })

export const videoPlaylistPrismaSelectClause: VideoPlaylistPrismaSelectClause = {
  ...videoPlaylistPrismaSelectFields,
  videos: { select: { video: { select: videoPrismaSelectFields } } },
}

export const videoPlaylistPrismaOrderByClause = Prisma.validator<Prisma.VideoPlaylistOrderByWithAggregationInput>()({
  name: 'asc',
})
