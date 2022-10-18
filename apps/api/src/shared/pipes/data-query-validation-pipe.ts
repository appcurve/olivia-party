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
import { isRawDataQueryParamsPartial } from '../../types/type-guards/is-raw-data-query-params-partial'

/**
 * Generic type that represents the string field names (properties) of the given `DTO`.
 *
 * `DTO` should be a DTO class or an interface serving in a similar role (i.e. to describe the shape of
 * response data).
 *
 * The type is a literal of `T`'s keys / public property names / data field names that represent data;
 * properties corresponding to functions such as constructors, getters and setters, etc. are excluded.
 *
 * @see DataQueryValidationPipe
 */
export type FieldNames<DTO extends object> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof DTO]: DTO[P] extends Function ? never : P extends symbol ? never : P extends number ? never : P
}[keyof DTO]

/*
 * Custom transform + validation pipe that processes request query string parameters (as parsed by
 * the framework) that may include sort/filter/pagination criteria that follows the project convention.
 *
 * The pipe's `transform()` method returns a strongly-typed `ParsedDataQueryParams` object corresponding
 * to the relevant query parameters of the request, or throws a `BadRequestException` if the params are invalid.
 *
 * Example of a query string supported by this pipe:
 * `?filter[name]=dora&filter[platform]=youtube&sort[name]=desc&sort[platform]=asc&offset=0&limit=25`
 *
 * The class generic should be provided the response DTO.
 *
 * The constructor accepts a config object to specify an array of allowed DTO field names for `sort` + `filter`
 * operations and an `isPaginated` flag to indicate if pagination params (offset + limit) are allowed.
 *
 * This pipe requires that the framework parses query strings using the `query-string` package (this is the default
 * of Express and therefore NestJS) because it implements a specific convention for parsing array and object
 * structures from query strings. Express will add the parsed query to the request object (`request.query`) and
 * NestJS exposes that to controller methods via the `Query()` param decorator.
 *
 * The default 'extended' behavior of `query-parser` parses items within square brackets as object properties.
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
 *     isPaginated: true,
 *     strict: true,
 *   }),
 * ) query: ParsedDataQueryParams<User, 'email', 'email' | 'name'>): Promise<PaginatedResponseDto<User>> {
 * ```
 *
 * Due nuances of TypeScript + NestJS the type of the query cannot be inferred from the return type of the
 * pipe's `transform()` method so you must take care to strongly type the constructor argument using the
 * generic `ParsedDataQueryParams` interface as shown above.
 *
 * @see ParsedDataQueryParams
 */
@Injectable()
export class DataQueryValidationPipe<DTO extends object> implements PipeTransform {
  constructor(
    private config: {
      /** List of allowed DTO field names for sort operations. */
      sort?: Exclude<FieldNames<DTO>, number | symbol>[]

      /** List of allowed DTO field names for filter operations. */
      filter?: Exclude<FieldNames<DTO>, number | symbol>[]

      /** Flag to indicate if 'limit' + 'offset' query parameters are allowed or not. */
      isPaginated?: boolean

      /**
       * Strict validation flag: enforces _only_ sort/filter/pagination params exist in the query.
       * The pipe will throw a `BadRequestException` if any other params are found on the request.
       */
      strict?: boolean
    },
  ) {}

  private getValidationExceptionMessage(): string {
    const supportedParams: string[] = []

    if (Array.isArray(this.config.sort)) {
      supportedParams.push('sort')
    }

    if (Array.isArray(this.config.filter)) {
      supportedParams.push('filter')
    }

    if (this.config.isPaginated) {
      supportedParams.push('offset', 'limit')
    }

    return `Invalid query string parameters. Supported parameters: ${supportedParams.join(', ')}`
  }

  /**
   * Pipe transform handler.
   *
   * @throws BadRequestException if validation fails for sort/filter/pagination related query params.
   */
  transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): ParsedDataQueryParams<
    DTO,
    typeof this.config.sort extends string[] ? typeof this.config.sort[number] : never,
    typeof this.config.filter extends string[] ? typeof this.config.filter[number] : never
  > {
    // universal check for type-narrowing purposes (for sake of ts compiler)
    if (!isRawDataQueryParamsPartial(value)) {
      throw new BadRequestException(this.getValidationExceptionMessage())
    }

    // optional strict check
    if (this.config?.strict && !isRawDataQueryParams(value)) {
      throw new BadRequestException(this.getValidationExceptionMessage())
    }

    // enforce that this pipe is only for query params
    if (metadata.type !== 'query') {
      throw new InternalServerErrorException('Error')
    }

    const sortFields: Array<string> = this.config?.sort ?? []
    const filterFields: Array<string> = this.config?.filter ?? []

    const errors: Record<string, string> = {}

    if (this.config.isPaginated) {
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
      ...(value.filter ? { filter: value.filter } : {}),
      ...(value.sort ? { sort: value.sort } : {}),
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
