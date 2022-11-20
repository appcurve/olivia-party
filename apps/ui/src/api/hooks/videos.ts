import type { VideoDto, CreateVideoDto, UpdateVideoDto, VideoDataParams } from '@firx/op-data-api'
import { createQueryCacheKeys } from '../lib/cache-keys'
import {
  fetchVideo,
  fetchVideos,
  fetchVideosWithParams,
  fetchCreateVideo,
  fetchMutateVideo,
  fetchDeleteVideo,
} from '../fetchers/videos'
import {
  createCreateQueryHook,
  createDeleteQueryHook,
  createListDataQueryHook,
  createListQueryHook,
  createMutateQueryHook,
  createSingleQueryHook,
} from '../lib/query-hook-factories'

const QUERY_SCOPE = 'videos' as const

const cacheKeys = createQueryCacheKeys(QUERY_SCOPE)
export { cacheKeys as videoQueryCacheKeys }

export const useVideosQuery = createListQueryHook<VideoDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchVideos,
})

export const useVideosDataQuery = createListDataQueryHook<VideoDto, 'player', VideoDataParams>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchVideosWithParams,
})

export const useVideoQuery = createSingleQueryHook({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchVideo,
})

export const useVideoCreateQuery = createCreateQueryHook<VideoDto, CreateVideoDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchCreateVideo,
})

export const useVideoMutateQuery = createMutateQueryHook<VideoDto, UpdateVideoDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchMutateVideo,
})

export const useVideoDeleteQuery = createDeleteQueryHook<VideoDto, 'player'>({
  cacheKeys,
  parentContextType: 'player',
  fetchFn: fetchDeleteVideo,
})
