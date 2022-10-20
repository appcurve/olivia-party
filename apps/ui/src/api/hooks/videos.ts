// @todo create shared lib with interfaces of api responses
// @todo DRY creation of hooks for future CRUD operations

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import type { VideoDto, CreateVideoDto, UpdateVideoDto } from '../../types/videos.types'
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import {
  fetchVideo,
  fetchVideos,
  fetchVideosWithParams,
  fetchCreateVideoWithParentContext,
  fetchDeleteVideoWithParentContext,
  fetchMutateVideoWithParentContext,
  VideosDataParams,
} from '../fetchers/videos'
import { createQueryCacheKeys } from '../lib/cache-keys'
import { useParentContext } from '../../context/ParentContextProvider'

const VIDEOS_QUERY_SCOPE = 'videos' as const

const cacheKeys = createQueryCacheKeys(VIDEOS_QUERY_SCOPE)
export { cacheKeys as videoQueryCacheKeys }

export function useVideosQuery(): UseQueryResult<VideoDto[]> {
  const { box } = useParentContext()

  return useQuery<VideoDto[]>(cacheKeys.list.all(), () => fetchVideos({ parentContext: box }), {
    enabled: !!box?.boxProfileUuid?.length,
  })
}

export function useVideosDataQuery(params: VideosDataParams): UseQueryResult<VideoDto[]> {
  const { box } = useParentContext()

  return useQuery<VideoDto[]>(
    cacheKeys.list.params(params),
    () => fetchVideosWithParams({ parentContext: box, params }),
    {
      enabled: !!box?.boxProfileUuid?.length,
      keepPreviousData: true,
    },
  )
}

export function useVideoQuery({ uuid }: { uuid: string | undefined }): UseQueryResult<VideoDto> {
  const { box } = useParentContext()

  return useQuery<VideoDto>(cacheKeys.detail.unique(uuid), () => fetchVideo({ parentContext: box, uuid }), {
    enabled: !!uuid?.length && !!box?.boxProfileUuid?.length,
  })
}

export function useVideoCreateQuery(
  options?: UseMutationOptions<VideoDto, Error, CreateVideoDto>,
): UseMutationResult<VideoDto, Error, CreateVideoDto> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<VideoDto, Error, CreateVideoDto>(fetchCreateVideoWithParentContext(box), {
    onSuccess: async (data, vars, context) => {
      // update query cache with response data
      const { uuid, ...restData } = data
      queryClient.setQueryData(cacheKeys.detail.unique(uuid), restData)

      await queryClient.invalidateQueries(cacheKeys.list.all())

      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, vars, context)
      }
    },
  })
}

export function useVideoMutateQuery(
  options?: UseMutationOptions<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>>,
): UseMutationResult<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>>(fetchMutateVideoWithParentContext(box), {
    onSuccess: async (data, vars, context) => {
      queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)
      await queryClient.invalidateQueries(cacheKeys.list.all())

      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, vars, context)
      }
    },
  })
}

interface VideoDeleteQueryContext {
  previous?: VideoDto[]
}

export function useVideoDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto, VideoDeleteQueryContext>,
): UseMutationResult<void, Error, ApiDeleteRequestDto, VideoDeleteQueryContext> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApiDeleteRequestDto, VideoDeleteQueryContext>(
    fetchDeleteVideoWithParentContext(box),
    {
      onSuccess: async (data, vars, context) => {
        // remove deleted item's data from cache
        queryClient.removeQueries(cacheKeys.detail.unique(vars.uuid))

        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }
      },
      onMutate: async ({ uuid }) => {
        // cancel any outstanding refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(cacheKeys.all())

        // snapshot previous value to enable rollback on error
        const previous = queryClient.getQueryData<VideoDto[]>(cacheKeys.list.all())
        const removed = previous?.filter((item) => item.uuid !== uuid)

        // optimistically update to the new value
        // (note: could refactor to use updater function which receives previous data as argument)
        if (previous) {
          queryClient.setQueryData<VideoDto[]>(cacheKeys.list.all(), removed)
        }

        return { previous }
      },
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<VideoDto[]>(cacheKeys.list.all(), context.previous)
        }
      },
      onSettled: () => {
        const promise = queryClient.invalidateQueries(cacheKeys.list.all())

        // react-query will await outcome if a promise is returned
        return promise
      },
    },
  )
}
