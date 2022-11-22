import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'

import type { DataQueryParams } from '@firx/op-data-api'
import { isRecord } from '@firx/ts-guards'

/**
 * Generic type utility that resolves to a union of string property names (field names) of the given response `DTO`.
 *
 * Class-based DTO's are supported for the generic argument `DTO` because the type definition excludes functions
 * (and therefore constructors, getters and setters, etc), plus symbol and number properties.
 *
 * @see DataQueryValidationPipe
 */
export type FieldNames<DTO extends object> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof DTO]: DTO[P] extends Function ? never : P extends symbol ? never : P extends number ? never : P
}[keyof DTO]

type QueryOperation = 'sort' | 'filter' | 'offset' | 'limit'

/**
 * Custom transform + validation pipe that processes request query string parameters (as parsed by
 * the framework) that may include valid sort/filter/pagination criteria per project convention.
 *
 * The pipe's `transform()` method returns a typed `ParsedDataQueryParams` object corresponding to the
 * query parameters of the request or throws a `BadRequestException` if the params are invalid.
 *
 * Example of a query string supported by this pipe:
 *
 * ```txt
 * ?filter[name]=dora&filter[platform]=youtube&sort[name]=desc&sort[platform]=asc&offset=0&limit=25
 * ```
 *
 * The pipe's constructor accepts a config object to specify an array of allowed DTO field names where
 * `sort` + `filter` operations are supported, plus an `isPaginated` flag to indicate if pagination params
 * (`offset` + `limit`) should be allowed.
 *
 * This pipe depends on the assumption that NestJS will parse query strings using the npm `qs` package (this is the
 * default behavior of Express and therefore NestJS).
 *
 * The `qs` package implements a specific convention for parsing array and object structures from query strings.
 * The default 'extended' behavior of `qs` used by NestJS parses items within square brackets as object properties.
 *
 * Express adds the parsed query string to the request object as `request.query` and NestJS exposes this value to
 * handler methods of controllers through the `Query()` param decorator.
 *
 * To restrict supported `sort` and/or `filter` operations to a subset of properties of a response DTO,
 * pass the names of the fields you want to allow as items in the corresponding array.
 *
 * Usage example:
 *
 * ```ts
 *   Get('example')
 *   exampleControllerGetHandler(@Query(new DataQueryValidationPipe<User>({
 *     sort: ['email'],
 *     filter: ['email', 'name'],
 *     isPaginated: true,
 *     strict: true,
 *   }),
 * ) query: ParsedDataQueryParams<User, 'email', 'email' | 'name'>): Promise<PaginatedResponseDto<User>> {
 * ```
 *
 * Take care to correctly type the result using the generic `RequestDataQueryParams` interface as shown above.
 * Due nuances of TypeScript classes + decorators and design decisions of NestJS, the type of the query cannot
 * be inferred from the return type of the decorator. Perhaps in some future TypeScript...
 *
 * @see ParsedDataQueryParams
 */
@Injectable()
export class DataQueryValidationPipe<DTO extends Record<string, unknown>> implements PipeTransform {
  private supportedQueryOperations: QueryOperation[]

  constructor(
    private config: {
      /** List of allowed DTO field names for sort operations. */
      sort?: FieldNames<DTO>[] // Exclude<FieldNames<DTO>, number | symbol>[]

      /** List of allowed DTO field names for filter operations. */
      filter?: FieldNames<DTO>[] // Exclude<FieldNames<DTO>, number | symbol>[]

      /** Flag to indicate if 'limit' + 'offset' query parameters are allowed or not. */
      isPaginated?: boolean

      /**
       * Strict validation flag: enforces _only_ sort/filter/pagination params exist in the query.
       * The pipe will throw a `BadRequestException` if any other params are found on the request.
       */
      strict?: boolean
    },
  ) {
    this.supportedQueryOperations = this.getSupportedQueryOperations()
  }

  /**
   * Return an array of supported query operations based on the config passed to the constructor.
   */
  private getSupportedQueryOperations(): QueryOperation[] {
    const supported: QueryOperation[] = []

    if (Array.isArray(this.config.sort)) {
      supported.push('sort')
    }

    if (Array.isArray(this.config.filter)) {
      supported.push('filter')
    }

    if (this.config.isPaginated) {
      supported.push('offset', 'limit')
    }

    return supported
  }

  private getValidationExceptionMessage(): string {
    return `Invalid query string. ${
      this.config?.strict ? 'Strictly supported' : 'Supported'
    } parameters: ${this.supportedQueryOperations.join(', ')}`
  }

  /**
   * Validate sort param vs. config, returning `true` on success or an error message.
   */
  private validateSort<Q extends Record<string, unknown>>(
    query: Q,
    allowedSortFields: (keyof Partial<Q>)[],
  ): string | true {
    const entries = Object.entries(query['sort'] ?? {})

    if (
      entries.length &&
      !entries.every(
        ([fieldName, val]) =>
          allowedSortFields?.includes(fieldName) && typeof val === 'string' && ['asc', 'desc'].includes(val),
      )
    ) {
      return process.env.NODE_ENV === 'development'
        ? `Expected optional sort criteria for propert${allowedSortFields.length > 1 ? `ies` : 'y'} ${(
            allowedSortFields ?? []
          )
            .map((sf) => `'${String(sf)}'`)
            .join(', ')} with value${allowedSortFields.length > 1 ? `s` : ''} 'asc' or 'desc'`
        : `Invalid sort criteria: accepted sort values are 'asc' or 'desc'`
    }

    return true
  }

  /**
   * Validate filter param vs. config, returning `true` on success or an error message.
   */
  private validateFilter<Q extends Record<string, unknown>>(
    query: Q,
    allowedFilterFields: (keyof Partial<Q>)[],
  ): string | true {
    const entries = Object.entries(query['filter'] ?? {})

    if (
      entries.length &&
      !entries.every(([fieldName, val]) => allowedFilterFields?.includes(fieldName) && typeof val === 'string')
    ) {
      return process.env.NODE_ENV === 'development'
        ? `Expected optional filter critera for propert${allowedFilterFields.length > 1 ? `ies` : 'y'} ${(
            allowedFilterFields ?? []
          )
            .map((ff) => `'${String(ff)}'`)
            .join(', ')}.`
        : `Invalid filter criteria: filter not supported for requested field(s)`
    }

    return true
  }

  /**
   * Validate offset pagination param, returning the validated offset on success or an error message.
   */
  private validatePaginationOffset(input: unknown, isPaginated: boolean): string | number {
    if (!isPaginated && input !== undefined) {
      return 'invalid value'
    }

    const offset = Number(input ?? 0)

    if (!Number.isFinite(offset) || offset < 0) {
      return 'offset must be an integer >= 0'
    }

    return offset
  }

  /**
   * Validate limit pagination param, returning the validated limit on success or an error message.
   */
  private validatePaginationLimit(input: unknown, isPaginated: boolean): string | number {
    if (!isPaginated && input !== undefined) {
      return 'invalid value'
    }

    const limit = Number(input ?? 1)

    if (!Number.isFinite(limit) || limit < 1) {
      return 'limit must be an integer >= 1'
    }

    return limit
  }

  /**
   * Pipe transform handler.
   *
   * @throws BadRequestException if validation of sort/filter/pagination query params fails.
   */
  transform(query: unknown, metadata: ArgumentMetadata): DataQueryParams<DTO> {
    // enforce that this pipe is only for request query params
    if (metadata.type !== 'query') {
      throw new InternalServerErrorException('Invalid invocation of query param processing pipe')
    }

    if (!isRecord(query)) {
      throw new InternalServerErrorException('Error processing query parameters')
    }

    if (this.config?.strict) {
      const keys = Object.keys(query)
      if (keys.some((key) => !(this.supportedQueryOperations as string[]).includes(key))) {
        throw new BadRequestException(this.getValidationExceptionMessage())
      }
    }

    const validators = [
      ['sort', this.validateSort(query, this.config.sort ?? [])],
      ['filter', this.validateFilter(query, this.config.filter ?? [])],
      ['offset', this.validatePaginationOffset(query.offset, !!this.config.isPaginated)],
      ['limit', this.validatePaginationLimit(query.limit, !!this.config.isPaginated)],
    ]

    const errors = validators.filter(([, result]) => typeof result === 'string')

    if (errors.length) {
      throw new BadRequestException({
        message: 'Invalid query parameters',
        errors: errors.reduce((acc, [op, errorMessage]) => {
          return Object.assign(acc, { [String(op)]: errorMessage })
        }, {}),
      })
    }

    return {
      ...(query.filter ? { filter: query.filter } : {}),
      ...(query.sort ? { sort: query.sort } : {}),
      offset: Number(query.offset ?? 0),
      limit: Number(query.limit ?? 1),
    }
  }
}

// @future consider expanded operations beyond equality when the requirements arise
// an (example implementation -- conceptual idea follows):
//
// type FilterOperation = 'eq' | 'gt' | 'lt' // etc...
// interface ParsedDataQueryParams<S extends string = string, F extends string = string> {
//   sort?: Record<S, 'asc' | 'desc'>
//   filter?: Record<F, string | Record<FilterOperation, string>>
//   offset?: string
//   limit?: string
// }
//
// for filter records, string value implies ILIKE and object requires op specified as key
