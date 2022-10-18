import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'

import isInt from 'validator/lib/isInt'
import { ParsedDataQueryParams } from '../../types/query-params.types'
import { isRawDataQueryParams } from '../../types/type-guards/is-raw-data-query-params'

/**
 * Generic type that represents the field names (properties) of the given `DTO`.
 *
 * `DTO` should be a DTO class or an interface serving in a similar role (i.e. to describe the shape of
 * response data).
 *
 * The type is a literal of `T`'s keys / public property names / data field names that represent data;
 * properties corresponding to functions such as constructors, getters and setters, etc. are excluded.
 *
 * @see DataQueryValidationPipe
 */
export type FieldNames<DTO> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof DTO]: DTO[P] extends Function ? never : P
}[keyof DTO]

/*
 * Custom transform + validation pipe that returns the `ParsedDataQueryParams` object that corresponds to the
 * sort/filter/pagination params of a request query string that follows the project convention.
 *
 * Example query string supported by this pipe:
 * `?filter[name]=dora&filter[platform]=youtube&sort[name]=desc&offset=0&limit=25`
 *
 * This pipe requires that the framework parses query strings using the `query-string` package (this is the default
 * of ExpressJS and therefore NestJS). The package implements specific conventions for specifying array and object
 * structures in query strings.
 *
 * The default 'extended' behavior of `query-parser` will parse items within square brackets as object properties.
 *
 * To restrict supported `sort` and/or `filter` operations to a subset of properties of a response DTO,
 * pass the names of the fields you want to allow as items in the corresponding array.
 *
 * Usage example:
 *
 * ```ts
 * // e.g. Get('example')
 * exampleControllerGetMethod(@Query(new DataQueryValidationPipe<User>({
 *     sort: ['email'],
 *     filter: ['email', 'name'],
 *   }),
 * ) paramsDto: ParsedDataQueryParams<'email', 'email' | 'name'>): Promise<PaginatedResponseDto<User>> {
 * ```
 */
@Injectable()
export class DataQueryValidationPipe<T> implements PipeTransform {
  constructor(
    private allowedFields: {
      sort?: Exclude<FieldNames<T>, number | symbol>[]
      filter?: Exclude<FieldNames<T>, number | symbol>[]
    },
    private isPaginated: boolean = false,
  ) {}

  transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): ParsedDataQueryParams<
    typeof this.allowedFields.sort extends string[] ? typeof this.allowedFields.sort[number] : string,
    typeof this.allowedFields.filter extends string[] ? typeof this.allowedFields.filter[number] : string
  > {
    if (!isRawDataQueryParams(value)) {
      throw new BadRequestException(
        'Invalid query string parameters. Supported parameters: sort, filter, offset, limit',
      )
    }

    if (!(metadata.type === 'query')) {
      throw new InternalServerErrorException('Error')
    }

    const sortFields: Array<string> = this.allowedFields?.sort ?? []
    const filterFields: Array<string> = this.allowedFields?.filter ?? []

    const errors: Record<string, string> = {}

    if (this.isPaginated) {
      const isValidOffset = value.offset ? isInt(value.offset, { min: 0 }) : true
      const isValidLimit = value.limit ? isInt(value.limit, { min: 1 }) : true

      if (!isValidOffset) {
        errors['offset'] = `offset must be an integer >= 0`
      }

      if (!isValidLimit) {
        errors['limit'] = `limit must be an integer >= 1`
      }
    } else {
      if (value.offset !== undefined) {
        errors['offset'] = 'invalid value'
      }

      if (value.limit !== undefined) {
        errors['limit'] = 'invalid value'
      }
    }

    const isValidSortFields = value.sort
      ? Object.entries(value.sort).every(
          ([fieldName, val]) =>
            sortFields?.includes(fieldName) && typeof val === 'string' && ['asc', 'desc'].includes(val),
        )
      : true
    const isValidFilterFields = value.filter
      ? Object.entries(value.filter).every(
          ([fieldName, val]) => filterFields?.includes(fieldName) && typeof val === 'string',
        )
      : true

    if (!isValidSortFields) {
      if (process.env.NODE_ENV === 'development') {
        errors['sort'] = `expecting object with optional propert${sortFields.length > 1 ? `ies` : 'y'} ${(
          sortFields ?? []
        )
          .map((sf) => `'${sf}'`)
          .join(', ')} with value${sortFields.length > 1 ? `s` : ''} 'asc' or 'desc'`
      } else {
        errors['sort'] = `accepted sort values are 'asc' or 'desc'`
      }
    }

    if (!isValidFilterFields) {
      if (process.env.NODE_ENV === 'development') {
        errors['filter'] = `expecting object with optional propert${sortFields.length > 1 ? `ies` : 'y'} ${(
          filterFields ?? []
        )
          .map((ff) => `'${ff}'`)
          .join(', ')} and string value${sortFields.length > 1 ? `s` : ''}`
      } else {
        errors['filter'] = `invalid filter criteria`
      }
    }

    if (Object.keys(errors).length) {
      throw new BadRequestException({
        message: 'Invalid query parameters',
        errors,
      })
    }

    return {
      ...((value.filter ? { filter: value.filter } : {}) as ParsedDataQueryParams['filter']),
      ...((value.sort ? { sort: value.sort } : {}) as ParsedDataQueryParams['sort']),
      offset: Number(value.offset ?? 0),
      limit: Number(value.limit ?? 1),
    }
  }
}

// @future consider expanded operations beyond equality when the requirements arise
// an (example implementation idea follows):
//
// type QueryOperation = 'eq' | 'gt' | 'lt' // etc...
// interface ParsedDataQueryParams<S extends string = string, F extends string = string> {
//   sort?: Record<S, 'asc' | 'desc'>
//   filter?: Record<F, string | Record<QueryOperation, string>>
//   offset?: string
//   limit?: string
// }
//
// for filter records, string value implies ILIKE and object requires op specified as key
