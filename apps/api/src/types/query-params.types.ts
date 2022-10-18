/**
 * Generic interface for data query 'page sort filter' params provided via URL query string.
 *
 * `S` + `F` generics should be string literal types that correspond to data fields that
 * API controller methods will support sort (`S`) and filter (`F`) operations on.
 *
 * This interface should be used along with validation e.g. `DataQueryValidationPipe` to ensure
 * that only supported DTO fields are referenced.
 *
 * This interface assumes that query strings are parsed using the npm `query-string` package
 * per project requirements.
 *
 * @see {@link https://www.npmjs.com/package/query-string }
 * @see DataQueryValidationPipe
 */
export interface RawDataQueryParams<
  DTO extends object,
  S extends keyof DTO | string = string,
  F extends keyof DTO | string = string,
> {
  sort?: Partial<Record<S, string>>
  filter?: Partial<Record<F, string>>
  offset?: string
  limit?: string
}

/**
 * Generic interface for data query 'page sort filter' params provided via URL query string.
 *
 * `S` + `F` generics should be string literal types that correspond to data fields that
 * API controller methods will support sort (`S`) and filter (`F`) operations on.
 *
 * This interface should be used along with validation e.g. `DataQueryValidationPipe` to ensure
 * that only supported DTO fields are referenced.
 *
 * This interface assumes that query strings are parsed using the npm `query-string` package
 * per project requirements.
 *
 * @see {@link https://www.npmjs.com/package/query-string }
 * @see DataQueryValidationPipe
 */
export interface ParsedDataQueryParams<DTO extends object, S extends keyof DTO, F extends keyof DTO> {
  sort?: Partial<Record<S, 'asc' | 'desc'>>
  filter?: Partial<Record<F, string>>
  offset?: number
  limit?: number
}
