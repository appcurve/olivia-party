import { isRecord, isStringKeyValueRecord } from '@firx/ts-guards'
import type { RawDataQueryParams } from '../query-params.types'

/**
 * Type guard that determines if the given input is a non-generic `Partial<RawDataQueryParams<object>>` object.
 *
 * Input objects are permitted to include arbitrary properties unrelated to `RawDataQueryParams`.
 *
 * The guard enforces that the allowed keys 'sort', 'filter', 'offset', and 'limit' have the expected
 * type of values only if they are specified.
 *
 * The guard does not enforce types specific to any DTO, i.e. 'sort' + 'filter' can specify of arbitrary
 * strings vs. only property names of a given DTO.
 *
 * @see RawDataQueryParams
 * @see ParsedDataQueryParams
 * @see DataQueryValidationPipe
 */
export const isRawDataQueryParamsPartial = (x: unknown): x is Partial<RawDataQueryParams<object>> => {
  if (!isRecord(x)) {
    return false
  }

  if ('sort' in x) {
    if (!isStringKeyValueRecord(x.sort)) {
      return false
    }

    if (
      !Object.entries(x.sort).every(([key, value]) => typeof key === 'string' && (value === 'asc' || value === 'desc'))
    ) {
      return false
    }
  }

  if ('filter' in x && !isStringKeyValueRecord(x.filter)) {
    return false
  }

  if ('offset' in x && !Number.isFinite(Number(x.offset))) {
    return false
  }

  if ('limit' in x && !Number.isFinite(Number(x.limit))) {
    return false
  }

  return true
}
