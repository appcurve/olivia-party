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

export const useVideosQuery = createListQueryHook<VideoDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchVideos,
})

export const useVideosDataQuery = createListDataQueryHook<VideoDto, 'box', VideoDataParams>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchVideosWithParams,
})

export const useVideoQuery = createSingleQueryHook({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchVideo,
})

export const useVideoCreateQuery = createCreateQueryHook<VideoDto, CreateVideoDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchCreateVideo,
})

export const useVideoMutateQuery = createMutateQueryHook<VideoDto, UpdateVideoDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchMutateVideo,
})

export const useVideoDeleteQuery = createDeleteQueryHook<VideoDto, 'box'>({
  cacheKeys,
  parentContextType: 'box',
  fetchFn: fetchDeleteVideo,
})
