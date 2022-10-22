import type { ApiDataObject, DataQueryParams, RequiredIdentifier } from '@firx/op-data-api'
import type { ParentContext, ParentContextType } from '../../context/ParentContextProvider'

export type FetchManyFunction<
  DTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (parentContext?: ParentContext[PCT]) => Promise<DTO[]>
  : PCT extends undefined
  ? () => Promise<DTO[]>
  : never

export type FetchManyWithParamsFunction<
  DTO extends object,
  PCT extends ParentContextType | undefined,
  P extends DataQueryParams<DTO>,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; params?: P }) => Promise<DTO[]>
  : PCT extends undefined
  ? (queryContext: { params?: P }) => Promise<DTO[]>
  : never

export type FetchOneFunction<
  DTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; uuid: string | undefined }) => Promise<DTO>
  : PCT extends undefined
  ? (queryContext: { uuid: string | undefined }) => Promise<DTO>
  : never

export type FetchStaticSingleFunction<
  DTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT] }) => Promise<DTO>
  : PCT extends undefined
  ? () => Promise<DTO>
  : never

export type FetchCreateFunction<
  DTO extends { uuid: string },
  CDTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; data: CDTO }) => Promise<DTO>
  : PCT extends undefined
  ? (queryContext: { data: CDTO }) => Promise<DTO>
  : never

/**
 * Type of data provided to fetch function for mutations depending if the request is for an
 * `ApiDataObject` or a static endpoint path with no identifiers (e.g. /user/profile).
 */
export type MutateRequestData<DTO extends ApiDataObject | object, MDTO extends object> = DTO extends ApiDataObject
  ? RequiredIdentifier<MDTO>
  : MDTO

export type FetchMutateFunction<
  DTO extends ApiDataObject | object,
  MDTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; data: MutateRequestData<DTO, MDTO> }) => Promise<DTO>
  : PCT extends undefined
  ? (queryContext: { data: MutateRequestData<DTO, MDTO> }) => Promise<DTO>
  : never

export type FetchDeleteFunction<PCT extends ParentContextType | undefined> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; data: ApiDataObject }) => Promise<void>
  : PCT extends undefined
  ? (queryContext: { data: ApiDataObject }) => Promise<void>
  : never
