import type { SortType } from './sort-type.type'

/**
 * Request query params for data sort/filter/pagination operations.
 *
 * Generic parameters:
 * - response DTO
 * - subset of DTO property names where sort operations are supported (literal union)
 * - subset of DTO property names where filter operatiosn are supported (literal union)
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
