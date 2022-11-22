import { apiFetchData } from './api-fetch-data'
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

/**
 * @wip @todo implement factories for the fetch functions themselves / or tie into the query-hook-factories.
 * goal is for an increasingly streamlined process to working with common API operations + react-query
 */

/*
 * Design Decision: the `parentContext` concept applies to requests with "parent" data associations.
 * For example: players (parent) have one-to-many videos (children).
 *
 * Implementing this concept helps accommodate various nuances of the nextjs router and react-query.
 */

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

      return apiFetchData<DTO[]>(typeof endpointPath === 'string' ? endpointPath : endpointPath(parentContext), {
        method: 'GET',
      })
    }
  }

  return () =>
    apiFetchData<DTO[]>(typeof endpointPath === 'string' ? endpointPath : endpointPath(), {
      method: 'GET',
    })
}
