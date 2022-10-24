import type { RawDataQueryParams } from '../query-params.types'
import { isRawDataQueryParamsPartial } from './is-raw-data-query-params-partial'

/**
 * Type guard that determines if the given input is a non-generic `RawDataQueryParams<object>` object.
 *
 * The guard strictly enforces that only the allowed keys exist (if they exist):
 * 'sort', 'filter', 'offset', 'limit'.
 *
 * The guard does not enforce types specific to any DTO, i.e. 'sort' + 'filter' can specify of arbitrary
 * strings vs. only property names of a given DTO.
 *
 * @see RawDataQueryParams
 * @see ParsedDataQueryParams
 * @see DataQueryValidationPipe
 */
export const isRawDataQueryParams = (x: unknown): x is RawDataQueryParams<object> => {
  return (
    isRawDataQueryParamsPartial(x) &&
    Object.keys(x).every((key) => ['sort', 'filter', 'offset', 'limit'].includes(key)) &&
    Object.getOwnPropertySymbols(x).length === 0
  )
}
