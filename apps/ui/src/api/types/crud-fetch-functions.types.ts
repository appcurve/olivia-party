import type { ApiDataObject, DataQueryParams, RequiredIdentifier } from '@firx/op-data-api'
import type { ParentContext, ParentContextType } from '../../context/ParentContextProvider'

/**
 * Generic fetch function ("fetcher") for GET requests to a REST-like API for a many
 * `ApiDataObject`'s.
 *
 * Supports a "fetch all"/"fetch list" request without any params.
 */
export type FetchManyFunction<
  DTO extends ApiDataObject | object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (parentContext?: ParentContext[PCT]) => Promise<DTO[]>
  : PCT extends undefined
  ? () => Promise<DTO[]>
  : never

/**
 * Generic fetch function ("fetcher") for GET requests to a REST-like API for many
 * `ApiDataObject`'s that may include `DataQueryParams` (sort/filter/pagination params).
 */
export type FetchManyWithParamsFunction<
  DTO extends ApiDataObject | object,
  PCT extends ParentContextType | undefined,
  P extends DataQueryParams<DTO>,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; params?: P }) => Promise<DTO[]>
  : PCT extends undefined
  ? (queryContext: { params?: P }) => Promise<DTO[]>
  : never

/**
 * Generic fetch function ("fetcher") for GET requests to a REST-like API for a single
 * `ApiDataObject`.
 */
export type FetchOneFunction<
  DTO extends ApiDataObject | object,
  PCT extends ParentContextType | undefined | never,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; uuid: string | undefined }) => Promise<DTO>
  : PCT extends undefined
  ? (queryContext: { uuid: string | undefined }) => Promise<DTO>
  : never

/**
 * Generic fetch function ("fetcher") for GET requests to a REST-like API to non-dynamic
 * endpoint paths.
 *
 * @todo deprecate this + tighten types to wrap into FetchOne (refactor to simplify the TypeScript API)
 */
export type FetchStaticFunction<
  DTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT] }) => Promise<DTO>
  : PCT extends undefined
  ? () => Promise<DTO>
  : never

/**
 * Generic fetch create mutation function ("fetcher") for create requests to a REST-like API.
 */
export type FetchCreateFunction<
  DTO extends ApiDataObject | object,
  CDTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; data: CDTO }) => Promise<DTO>
  : PCT extends undefined
  ? (queryContext: { data: CDTO }) => Promise<DTO>
  : never

/**
 * Generic request body type of a fetch mutation function ("fetcher") that hits a REST-like API.
 */
export type MutateRequestData<DTO extends ApiDataObject | object, MDTO extends object> = DTO extends ApiDataObject
  ? RequiredIdentifier<MDTO>
  : MDTO

/**
 * Generic fetch mutation function ("fetcher") for update requests to a REST-like API.
 */
export type FetchMutateFunction<
  DTO extends ApiDataObject | object,
  MDTO extends object,
  PCT extends ParentContextType | undefined,
> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; data: MutateRequestData<DTO, MDTO> }) => Promise<DTO>
  : PCT extends undefined
  ? (queryContext: { data: MutateRequestData<DTO, MDTO> }) => Promise<DTO>
  : never

/**
 * Generic fetch delete mutation function ("fetcher") for delete requests to a REST-like API.
 */
export type FetchDeleteFunction<PCT extends ParentContextType | undefined> = PCT extends keyof ParentContext
  ? (queryContext: { parentContext?: ParentContext[PCT]; data: ApiDataObject }) => Promise<void>
  : PCT extends undefined
  ? (queryContext: { data: ApiDataObject }) => Promise<void>
  : never
