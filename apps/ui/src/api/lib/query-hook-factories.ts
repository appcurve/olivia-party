import { DataQueryParams } from '@firx/op-data-api'
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import { ParentContext, ParentContextType, useSelectParentContext } from '../../context/ParentContextProvider'
import { CacheKeyDict } from './cache-keys'

export const todo = {}

/**
 * Type utility that ensures the given DTO requires the `uuid` property.
 * @todo aiming to deprecate ApiMutateRequestDto
 */
export type RequiredIdentifier<DTO extends object> = Required<{ uuid: string }> & Omit<DTO, 'uuid'>

export interface ListQueryHookFactoryParams<
  DTO extends object,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
> {
  // scope: S
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (parentContext?: ParentContext[PCTX]) => Promise<DTO[]>
    : PCTX extends undefined
    ? () => Promise<DTO[]>
    : never
}

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
      enabled: parentContextType
        ? Object.keys(parentContext ?? {}).every((item) => item !== undefined && item !== null)
        : true,
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
      enabled: parentContextType
        ? Object.keys(parentContext ?? {}).every((item) => item !== undefined && item !== null)
        : true,
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
      enabled: parentContextType
        ? Object.keys(parentContext ?? {}).every((item) => item !== undefined && item !== null) && !!uuid?.length
        : !!uuid?.length,
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

export interface MutateQueryHookFactoryParams<
  DTO extends { uuid: string },
  MDTO extends object,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
> {
  cacheKeys: CacheKeyDict<S>
  parentContextType?: PCTX
  fetchFn: PCTX extends keyof ParentContext
    ? (queryContext: { parentContext?: ParentContext[PCTX]; data: RequiredIdentifier<MDTO> }) => Promise<DTO>
    : PCTX extends undefined
    ? (queryContext: { data: RequiredIdentifier<MDTO> }) => Promise<DTO>
    : never
}

export function createMutateQueryHook<
  DTO extends { uuid: string },
  MDTO extends object,
  PCTX extends ParentContextType | undefined,
  S extends string = string,
>({ cacheKeys, parentContextType, fetchFn }: MutateQueryHookFactoryParams<DTO, MDTO, PCTX, S>) {
  return (
    options?: UseMutationOptions<DTO, Error, RequiredIdentifier<MDTO>>,
  ): UseMutationResult<DTO, Error, RequiredIdentifier<MDTO>> => {
    const parentContext = useSelectParentContext(parentContextType)
    const queryClient = useQueryClient()

    const fetcher = parentContextType
      ? (data: RequiredIdentifier<MDTO>): Promise<DTO> => fetchFn({ parentContext, data })
      : (data: RequiredIdentifier<MDTO>): Promise<DTO> => fetchFn({ data })

    return useMutation<DTO, Error, RequiredIdentifier<MDTO>>(fetcher, {
      onSuccess: async (data, vars, context) => {
        queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)
        await queryClient.invalidateQueries(cacheKeys.list.all())

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

export interface ApiDataObject {
  uuid: string
}

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
