import * as qs from 'qs'
import type { DataQueryParams } from './types/data-query-params.interface'

/**
 * Build the query string for an API data query endpoint.
 *
 * Leverages the `qs` library to generate a string that a default configuration of ExpressJS
 * (and hence NestJS) will parse into the appropriate `DataQueryParams` object on the back-end.
 */
export function buildDataQueryString<DTO extends object>(query: DataQueryParams<DTO>): string {
  return qs.stringify(query)
}
