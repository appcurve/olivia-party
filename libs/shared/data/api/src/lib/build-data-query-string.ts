import * as qs from 'qs'
import type { DataQueryParams } from './types/data-query-params.interface'

/**
 * Build the query string for an API data query endpoint from the given `params`.
 * 
 * Returns an empty string if the `params` value is `undefined` or an empty object.
 *
 * Implemented with the `qs` library to generate a query-string that a default configuration of ExpressJS
 * (and hence NestJS) will parse into the appropriate `DataQueryParams` object on the back-end.
 */
export function buildDataQueryString<DTO extends object>(params: DataQueryParams<DTO> | undefined): string {
  if (!params || Object.keys(params).length === 0) {
    return ''
  }

  return qs.stringify(params)
}
