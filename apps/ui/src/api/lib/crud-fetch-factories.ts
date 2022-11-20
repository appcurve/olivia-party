// @todo create shared lib for dto's / interfaces of api responses

// the parentContext on fetch function is optional is to support various nuances of nextjs router + react-query
// with greater flexibility and ease of typing.
// the fetchers will throw (via `getVideoGroupsRestEndpoint()`) if any values are undefined

import { apiFetch } from './api-fetch'
import { ApiDto, type DataQueryParams } from '@firx/op-data-api'
import { ParentContext, ParentContextType } from '../../context/ParentContextProvider'
import {
  FetchCreateFunction,
  FetchDeleteFunction,
  FetchManyFunction,
  FetchManyWithParamsFunction,
  FetchMutateFunction,
  FetchOneFunction,
  FetchStaticFunction,
} from '../types/crud-fetch-functions.types'

// const REST_ENDPOINT_BASE = '/opx' as const

export interface CrudFetch<
  DTO extends ApiDto | object,
  CDTO extends object,
  MDTO extends object,
  P extends DataQueryParams<DTO>,
  PCT extends ParentContextType | undefined,
> {
  fetchMany: FetchManyFunction<DTO, PCT>
  fetchManyWithParams: FetchManyWithParamsFunction<DTO, PCT, P>
  fetchOne: FetchOneFunction<DTO, PCT>
  fetchStaticOne: FetchStaticFunction<DTO, PCT>
  fetchStaticMany: FetchStaticFunction<DTO[], PCT>
  create: FetchCreateFunction<DTO, CDTO, PCT>
  mutate: FetchMutateFunction<DTO, MDTO, PCT>
  delete: FetchDeleteFunction<PCT>
}

export type ParentContextValidator = <PCT extends ParentContextType>(parentContext?: ParentContext[PCT]) => boolean

export type FetchManyUrlBuilder = <PCT extends ParentContextType>(parentContext?: ParentContext[PCT]) => string

// export const getFetchFunction = () => {}

export type CreateFetchManyFunctionFactory<DTO extends object, PCT extends ParentContextType | undefined> = (
  endpointPath: string | FetchManyUrlBuilder,
  parentContextType?: PCT,
) => FetchManyFunction<DTO, PCT>

export const createfetchManyFunction: CreateFetchManyFunctionFactory<object, ParentContextType | undefined> = <
  DTO extends object,
  PCT extends ParentContextType | undefined,
>(
  endpointPath: string | FetchManyUrlBuilder,
  parentContextType?: PCT,
  parentContextValidator?: PCT extends ParentContextType ? ParentContextValidator : never,
) => {
  if (parentContextType) {
    return (parentContext?: PCT extends ParentContextType ? ParentContext[PCT] : undefined) => {
      if (typeof parentContextValidator === 'function' && !parentContextValidator(parentContext)) {
        throw Error('Invalid parent context')
      }

      return apiFetch<DTO[]>(typeof endpointPath === 'string' ? endpointPath : endpointPath(parentContext), {
        method: 'GET',
      })
    }
  }

  return () =>
    apiFetch<DTO[]>(typeof endpointPath === 'string' ? endpointPath : endpointPath(), {
      method: 'GET',
    })
}
