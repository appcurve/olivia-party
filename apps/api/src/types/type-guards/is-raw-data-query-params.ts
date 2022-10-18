import { isRecord } from '@firx/ts-guards'
import type { RawDataQueryParams } from '../query-params.types'

/**
 * Type guard that determines if the given input is a non-generic `RawDataQueryParams` object.
 *
 * The guard strictly enforces the allowed keys: 'sort', 'filter', 'offset', 'limit', however it
 * does not enforce types beyond that and is not specific to any DTO.
 *
 * `RawDataQueryParams` objects will be produced by the `query-parser` package used by ExpressJS and
 * hence NestJS (in default configuration) for any query strings that adhere to the project
 * convention for sort/filter/pagination query parameters.
 *
 * The NestJS pipe `DataQueryValidationPipe` can be invoked by controller methods via the `Query()`
 * decorator to provide validation of this input object for a given DTO and return a corresponding
 * `ParsedDataQueryParams` object.
 *
 * @see RawDataQueryParams
 * @see ParsedDataQueryParams
 * @see DataQueryValidationPipe
 */
export const isRawDataQueryParams = (x: unknown): x is RawDataQueryParams => {
  return (
    isRecord(x) &&
    Object.entries(x).every(([key, value]) => {
      if (!['sort', 'filter', 'offset', 'limit'].includes(key)) {
        return false
      }

      if (key === 'sort' || key === 'filter') {
        if (!isRecord(value)) {
          return false
        }
      }

      if ((key === 'offset' || key === 'limit') && !Number.isFinite(Number(value))) {
        return false
      }

      return true
    })
  )
}
