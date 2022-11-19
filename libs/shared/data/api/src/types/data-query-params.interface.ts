import type { SortType } from './sort-type.type'

/**
 * Generic interface for data query params of the given `DTO` for requests to API endpoints that implement
 * sort/filter/pagination functionality.
 *
 * The 2nd and 3rd generic arguments are to specify subsets of DTO properties for sort (`S`) and filter (`F`)
 * operations for cases where the back-end only supports these operations on certain fields.
 *
 * Note: sql's offset + limit are analagous to prisma's skip + take
 */
export interface DataQueryParams<DTO extends object, S extends keyof DTO = keyof DTO, F extends keyof DTO = keyof DTO> {
  sort?: {
    [T in S]?: SortType
  }
  filter?: {
    [T in F]?: string
  }
  offset?: number
  limit?: number
}
