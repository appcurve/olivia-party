import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import type { ApiDataObject, DataQueryParams } from '@firx/op-data-api'
import { ParentContext, ParentContextType, useSelectParentContext } from '../../context/ParentContextProvider'
import { CacheKeyDict } from './cache-keys'
import {
  FetchCreateFunction,
  FetchDeleteFunction,
  FetchManyFunction,
  FetchManyWithParamsFunction,
  FetchMutateFunction,
  FetchOneFunction,
  FetchStaticFunction,
  MutateRequestData,
} from '../types/crud-fetch-functions.types'

// @todo spruce up the query-hook-factories api so user doesn't have to provide cachekeys
// might as well put cache key function factories here too

/**
 * Returns a boolean indicating if a given query with parent context should be enabled based on if all object
 * values in its required slice of `ParentContext` is available (not `undefined` and not `null`) or not.
 *
 * The `ParentContext` required by a query may not be available where it depends on async data or path values of a
 * NextJS dynamic route obtained from the NextJS router (as these are not available until `router.isReady`).
 */
export function getParentContextQueryEnabled<T extends ParentContextType>(parentContext?: ParentContext[T]): boolean {
  return !!parentContext && Object.values(parentContext).every((item) => item !== undefined && item !== null)
}

export interface ListQueryHookFactoryParams<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCT
  fetchFn: FetchManyFunction<DTO, PCT>
}

/**
 * Hook factory for RESTful API's that creates a query hook that manages requests + caching for many
 * `DTO` objects.
 */
export function createListQueryHook<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: ListQueryHookFactoryParams<DTO, PCT, S>) {
  return (): UseQueryResult<DTO[]> => {
    const parentContext = useSelectParentContext(parentContextType)

    const fetcher =
      parentContextType === undefined ? (): Promise<DTO[]> => fetchFn() : (): Promise<DTO[]> => fetchFn(parentContext)

    return useQuery<DTO[]>(cacheKeys.list.all(), fetcher, {
      enabled: parentContextType ? getParentContextQueryEnabled(parentContext) : true,
    })
  }
}

export interface ListDataQueryHookFactoryParams<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  P extends DataQueryParams<DTO>,
  S extends string = string,
> extends Pick<ListQueryHookFactoryParams<DTO, PCT, S>, 'cacheKeys' | 'parentContextType'> {
  fetchFn: FetchManyWithParamsFunction<DTO, PCT, P>
}

/**
 * Hook factory for RESTful API's that creates a query hook that manages requests + caching for many `DTO`
 * objects with the given query params specifying supported sort/filter/paging operations.
 */
export function createListDataQueryHook<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  P extends DataQueryParams<DTO>,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: ListDataQueryHookFactoryParams<DTO, PCT, P, S>) {
  return (queryParams: P): UseQueryResult<DTO[]> => {
    const parentContext = useSelectParentContext(parentContextType)

    const fetcher = parentContextType
      ? (): Promise<DTO[]> => fetchFn({ parentContext, params: queryParams })
      : (): Promise<DTO[]> => fetchFn({ params: queryParams })

    return useQuery<DTO[]>(cacheKeys.list.params(queryParams), fetcher, {
      enabled: parentContextType ? getParentContextQueryEnabled(parentContext) : true,
      keepPreviousData: true,
    })
  }
}

export interface SingleQueryHookFactoryParams<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCT
  fetchFn: FetchOneFunction<DTO, PCT>
}

/**
 * Hook factory for RESTful API's that creates a query hook that manages requests + caching for a single
 * `DTO` object identified by `uuid`.
 */
export function createSingleQueryHook<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: SingleQueryHookFactoryParams<DTO, PCT, S>) {
  return ({ uuid }: { uuid: string | undefined }): UseQueryResult<DTO> => {
    const parentContext = useSelectParentContext(parentContextType)

    const fetcher = parentContextType
      ? (): Promise<DTO> => fetchFn({ parentContext, uuid })
      : (): Promise<DTO> => fetchFn({ uuid })

    return useQuery<DTO>(cacheKeys.detail.unique(uuid), fetcher, {
      enabled: parentContextType ? getParentContextQueryEnabled(parentContext) && !!uuid?.length : !!uuid?.length,
    })
  }
}

export interface StaticQueryHookFactoryParams<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKey: string | Record<string, unknown>
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCT
  fetchFn: FetchStaticFunction<DTO, PCT>
}

/**
 * Hook factory that creates a query hook for sending requests to static/fixed API routes where there are no
 * dynamic path segments and no query string parameters (e.g. /user/profile) and the given `DTO` is returned
 * as the response.
 *
 * Use generic type `DTO` for API routes that return a single objects and `DTO[]` for API routes that return many.
 */
export function createStaticQueryHook<
  DTO extends object,
  CX extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKey, cacheKeys, parentContextType, fetchFn }: StaticQueryHookFactoryParams<DTO, CX, S>) {
  return (): UseQueryResult<DTO> => {
    const parentContext = useSelectParentContext(parentContextType)

    // not sure why ts insisting on arg for fetch in case w/ undefined parentContext when logic is similar as other hooks
    // either way js won't complain if empty object passed for that case
    const fetcher = parentContextType ? (): Promise<DTO> => fetchFn({ parentContext }) : (): Promise<DTO> => fetchFn({})

    return useQuery<DTO>(cacheKeys.static.key(cacheKey), fetcher, {
      enabled: parentContextType ? getParentContextQueryEnabled(parentContext) : true,
    })
  }
}

export interface CreateQueryHookFactoryParams<
  DTO extends { uuid: string },
  CDTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCT
  fetchFn: FetchCreateFunction<DTO, CDTO, PCT>
}

/**
 * Hook factory that creates a query hook for creating new `DTO` objects vs. a RESTful API that accepts
 * request data in the form of `CDTO` ("create DTO") and returns the created `DTO` in its response.
 *
 * On success, the hook implementation will invalidate the `list` cache key for any queries of
 * the same scope `S`.
 */
export function createCreateQueryHook<
  DTO extends { uuid: string },
  CDTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: CreateQueryHookFactoryParams<DTO, CDTO, PCT, S>) {
  return (options?: UseMutationOptions<DTO, Error, CDTO>): UseMutationResult<DTO, Error, CDTO> => {
    const parentContext = useSelectParentContext(parentContextType)
    const queryClient = useQueryClient()

    const fetcher = parentContextType
      ? (data: CDTO): Promise<DTO> => fetchFn({ parentContext, data })
      : (data: CDTO): Promise<DTO> => fetchFn({ data })

    return useMutation<DTO, Error, CDTO>(fetcher, {
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
}

export interface MutateQueryHookFactoryParams<
  DTO extends ApiDataObject | object,
  MDTO extends object,
  PCT extends ParentContextType | undefined,
  S extends string = string,
> {
  /**
   * Mutation requests to static endpoint routes (i.e. mutation requests without a unique object identifer)
   * must specify a `cacheKey` that's unique within the query scope/namespace `S`.
   *
   * For requests for `ApiDataObject`'s with a unique `uuid`, the uuid value is used as the cache key.
   */
  cacheKey?: DTO extends ApiDataObject ? undefined : string | Record<string, unknown>
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCT
  fetchFn: FetchMutateFunction<DTO, MDTO, PCT>
}

/**
 * Hook factory that creates a query hook for mutating/updating existing `DTO` objects identified by `uuid`
 * vs. a RESTful API that accepts request data in the form of `MDTO` (mutate DTO) and returns the successfully
 * mutated `DTO` object in its response.
 *
 * On success, the hook implementation will invalidate the `list` cache key for any queries of
 * the same scope `S`.
 */
export function createMutateQueryHook<
  DTO extends ApiDataObject | object,
  MDTO extends object,
  PCT extends ParentContextType | undefined = undefined,
  S extends string = string,
>({ cacheKey, cacheKeys, parentContextType, fetchFn }: MutateQueryHookFactoryParams<DTO, MDTO, PCT, S>) {
  return (
    options?: UseMutationOptions<DTO, Error, MutateRequestData<DTO, MDTO>>,
  ): UseMutationResult<DTO, Error, MutateRequestData<DTO, MDTO>> => {
    const parentContext = useSelectParentContext(parentContextType)
    const queryClient = useQueryClient()

    const fetcher = parentContextType
      ? (data: MutateRequestData<DTO, MDTO>): Promise<DTO> => fetchFn({ parentContext, data })
      : (data: MutateRequestData<DTO, MDTO>): Promise<DTO> => fetchFn({ data })

    return useMutation<DTO, Error, MutateRequestData<DTO, MDTO>>(fetcher, {
      onSuccess: async (data, vars, context) => {
        // @future mutate hook factory: seeing below, maybe made it too complex and cache keys 'detail'
        // can be used in static cases, or maybe have 2x mutation hook factories to cover each case

        if (cacheKey) {
          queryClient.setQueryData(cacheKeys.static.key(cacheKey), data)
          await queryClient.invalidateQueries(cacheKeys.static.all())
        }

        if (!cacheKey && 'uuid' in vars) {
          queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)
          await queryClient.invalidateQueries(cacheKeys.list.all())
        }

        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }
      },
    })
  }
}

export interface DeleteQueryContext<DTO extends object> {
  previous?: DTO[]
}

/**
 * Hook factory that creates a query hook for deleting objects identified by `uuid` vs. a RESTful API that
 * returns no response data other than an http status indicating success.
 *
 * The hook implementation optimistically updates the query cache by removing the to-be-deleted item and
 * will roll back if the request fails.
 */
export interface DeleteQueryHookFactoryParams<PCT extends ParentContextType | undefined, S extends string = string> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCT
  fetchFn: FetchDeleteFunction<PCT>
}

export function createDeleteQueryHook<
  DTO extends ApiDataObject,
  PCT extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: DeleteQueryHookFactoryParams<PCT, S>) {
  return (
    options?: UseMutationOptions<void, Error, ApiDataObject, DeleteQueryContext<DTO>>,
  ): UseMutationResult<void, Error, ApiDataObject, DeleteQueryContext<DTO>> => {
    const parentContext = useSelectParentContext(parentContextType)
    const queryClient = useQueryClient()

    const fetcher = parentContextType
      ? (data: ApiDataObject): Promise<void> => fetchFn({ parentContext, data })
      : (data: ApiDataObject): Promise<void> => fetchFn({ data })

    return useMutation<void, Error, { uuid: string }, DeleteQueryContext<DTO>>(fetcher, {
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
        const previous = queryClient.getQueryData<DTO[]>(cacheKeys.list.all())
        const removed = previous?.filter((item) => item.uuid !== uuid)

        // optimistically update to the new value
        // (note: could refactor to use updater function which receives previous data as argument)
        if (previous) {
          queryClient.setQueryData<DTO[]>(cacheKeys.list.all(), removed)
        }

        return { previous }
      },
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<DTO[]>(cacheKeys.list.all(), context.previous)
        }
      },
      onSettled: () => {
        // react-query will await outcome if a promise is returned
        return queryClient.invalidateQueries(cacheKeys.list.all())
      },
    })
  }
}
