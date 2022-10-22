import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import type { ApiDataObject, RequiredIdentifier, DataQueryParams } from '@firx/op-data-api'
import { ParentContext, ParentContextType, useSelectParentContext } from '../../context/ParentContextProvider'
import { CacheKeyDict } from './cache-keys'

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
  PCTX extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (parentContext?: ParentContext[PCTX]) => Promise<DTO[]>
    : PCTX extends undefined
    ? () => Promise<DTO[]>
    : never
}

/**
 * Hook factory for RESTful API's that creates a query hook that manages requests + caching for many
 * `DTO` objects.
 */
export function createListQueryHook<
  DTO extends object,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: ListQueryHookFactoryParams<DTO, PCTX, S>) {
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
  PCTX extends ParentContextType | undefined,
  P extends DataQueryParams<DTO>,
  S extends string = string,
> extends Pick<ListQueryHookFactoryParams<DTO, PCTX, S>, 'cacheKeys' | 'parentContextType'> {
  fetchFn: PCTX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[PCTX]; params?: P }) => Promise<DTO[]>
    : PCTX extends undefined
    ? (queryContext: { params?: P }) => Promise<DTO[]>
    : never
}

/**
 * Hook factory for RESTful API's that creates a query hook that manages requests + caching for many `DTO`
 * objects with the given query params specifying supported sort/filter/paging operations.
 */
export function createListDataQueryHook<
  DTO extends object,
  PCTX extends ParentContextType | undefined,
  P extends DataQueryParams<DTO>,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: ListDataQueryHookFactoryParams<DTO, PCTX, P, S>) {
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
  PCTX extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[PCTX]; uuid: string | undefined }) => Promise<DTO>
    : PCTX extends undefined
    ? (queryContext: { uuid: string | undefined }) => Promise<DTO>
    : never
}

/**
 * Hook factory for RESTful API's that creates a query hook that manages requests + caching for a single
 * `DTO` object identified by `uuid`.
 */
export function createSingleQueryHook<
  DTO extends object,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: SingleQueryHookFactoryParams<DTO, PCTX, S>) {
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
  CX extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKey: string | Record<string, unknown>
  cacheKeys: CacheKeyDict<S>
  parentContextType?: CX
  fetchFn: CX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[CX] }) => Promise<DTO>
    : CX extends undefined
    ? () => Promise<DTO>
    : never
}

/**
 * Hook factory that creates a query hook for sending requests to static/fixed API routes where there are no
 * dynamic path segments and no query string parameters (e.g. /user/profile).
 *
 * A single `DTO` is returned in the response.
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
  PCTX extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[PCTX]; data: CDTO }) => Promise<DTO>
    : PCTX extends undefined
    ? (queryContext: { data: CDTO }) => Promise<DTO>
    : never
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
  PCTX extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: CreateQueryHookFactoryParams<DTO, CDTO, PCTX, S>) {
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

/**
 * Type of data provided to fetch function for mutations depending if the request is for an
 * `ApiDataObject` or a static endpoint path with no identifiers (e.g. /user/profile).
 */
type FetchData<DTO extends ApiDataObject | object, MDTO extends object> = DTO extends ApiDataObject
  ? RequiredIdentifier<MDTO>
  : MDTO

export interface MutateQueryHookFactoryParams<
  DTO extends ApiDataObject | object,
  MDTO extends object,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
> {
  /** Provide a cache key for requests to static endpoint routes (i.e. mutation requests without an identifier). */
  cacheKey?: string | Record<string, unknown>
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[PCTX]; data: FetchData<DTO, MDTO> }) => Promise<DTO>
    : PCTX extends undefined
    ? (queryContext: { data: FetchData<DTO, MDTO> }) => Promise<DTO>
    : never
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
  PCTX extends ParentContextType | undefined = undefined,
  S extends string = string,
>({ cacheKey, cacheKeys, parentContextType, fetchFn }: MutateQueryHookFactoryParams<DTO, MDTO, PCTX, S>) {
  return (
    options?: UseMutationOptions<DTO, Error, FetchData<DTO, MDTO>>,
  ): UseMutationResult<DTO, Error, FetchData<DTO, MDTO>> => {
    const parentContext = useSelectParentContext(parentContextType)
    const queryClient = useQueryClient()

    const fetcher = parentContextType
      ? (data: FetchData<DTO, MDTO>): Promise<DTO> => fetchFn({ parentContext, data })
      : (data: FetchData<DTO, MDTO>): Promise<DTO> => fetchFn({ data })

    return useMutation<DTO, Error, FetchData<DTO, MDTO>>(fetcher, {
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
export interface DeleteQueryHookFactoryParams<PCTX extends ParentContextType | undefined, S extends string = string> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[PCTX]; data: ApiDataObject }) => Promise<void>
    : PCTX extends undefined
    ? (queryContext: { data: ApiDataObject }) => Promise<void>
    : never
}

export function createDeleteQueryHook<
  DTO extends ApiDataObject,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: DeleteQueryHookFactoryParams<PCTX, S>) {
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
        const promise = queryClient.invalidateQueries(cacheKeys.list.all())

        // react-query will await outcome if a promise is returned
        return promise
      },
    })
  }
}
