import type { Uid } from '@firx/op-data-api'
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { NotFoundError } from '@prisma/client/runtime'

import { processError } from './lib/process-error'
// import { PrismaService } from './prisma.service'

/**
 * NestJS service that exposes helper functions for Prisma + NestJS.
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export class PrismaUtilsService {
  // private readonly prisma: PrismaService, // @Inject(forwardRef(() => PrismaService))

  /**
   * Error helper that checks if the given input argument is an instance of a common Prisma query error
   * and if so, returns (vs. throws) an appropriate corresponding NestJS error.
   */
  processError(error: unknown): NotFoundException | unknown {
    return processError(error)
  }

  /**
   * Type guard that evaluates if the given input is a Prisma Client `NotFoundError`.
   *
   * Note that Prisma only throws `NotFoundError`'s for "select" queries; it uses a separate set of errors
   * that are instances of `PrismaClientKnownRequestError` (e.g. P2001 - Record Does Not Exist) for other
   * types of queries such as update or delete.
   */
  isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError
  }

  /**
   * Return an object with either a `uuid` or `id` property with the value of the given unique identifier (`uid`)
   * depending on its type (`string` or `number`, respectively).
   *
   * This helper is for working with table schemas that feature dual unique identifiers: a serial
   * int and a string uuid.
   *
   * This object can be incorporated in the `where` clause of prisma queries made through the prisma client API.
   *
   * @deprecated superceded by more generally named getUidCondition()
   */
  getUidWhereCondition(uid: string | number): { uuid: string } | { id: number } {
    switch (typeof uid) {
      case 'string': {
        return { uuid: uid }
      }
      case 'number': {
        return { id: uid }
      }
      default: {
        throw new InternalServerErrorException(`Invalid identifier: '${uid}'`)
      }
    }
  }

  /**
   * Return an object with either a `uuid` or `id` property holding the value of the given unique identifier (`uid`),
   * determined by the type of the identifier (`string` or `number` respectively).
   *
   * This helper is for working with table/model schemas that feature both types of unique identifiers.
   *
   * The return value can be used to build arguments for the Prisma client API including in `where` clauses, join-like
   * operations with `connect`, etc.
   */
  getUidCondition(uid: Uid): { uuid: string } | { id: number } {
    switch (typeof uid) {
      case 'string': {
        return { uuid: uid }
      }
      case 'number': {
        return { id: uid }
      }
      default: {
        throw new InternalServerErrorException(`Invalid identifier: '${uid}'`)
      }
    }
  }

  getUidArrayInWhereCondition(uids: Uid[]): { uuid: { in: string[] } } | { id: { in: number[] } } {
    if (!uids.length) {
      throw new Error('Invalid argument: array of uids must not be empty')
    }

    const typeResult = uids.reduce((acc, curr: string | number) => {
      const type = typeof curr

      if (type !== 'string' && type !== 'number') {
        throw new Error(
          `Invalid type '${type}' encountered: values in array of UIDs must be all 'string' or all 'number'`,
        )
      }

      return acc.add(type)
    }, new Set<string>())

    if (typeResult.size > 1) {
      throw new Error('Invalid argument: array of uids must all be the same type (string or number)')
    }

    const [type] = typeResult

    switch (type) {
      case 'string': {
        return { uuid: { in: uids as string[] } }
      }
      case 'number': {
        return { id: { in: uids as number[] } }
      }
      default: {
        throw new Error(`Invalid uids argument`)
      }
    }
  }

  /**
   * Return the second argument when the first argument evaluates to `true`, otherwise return `{}`.
   *
   * This helper function provides syntactic sugar for writing prisma queries by providing a less
   * cluttered way to express the following conditional spread pattern that is very popular in the JS/TS ecosystem:
   *
   * ```ts
   * const config = {
   *   // conditionally spread the given object or an empty object (nothing)
   *   ...(conditional === true ? { example: 'eg' } : {})
   * }
   * ```
   *
   * Usage example:
   *
   * ```ts
   * const query = {
   *   ...conditionalClause(condition, { enabledAt: { not: null } })
   * }
   */
  conditionalClause<T extends object>(condition: boolean, obj: T): T | Record<string, never> {
    return condition === true ? obj : {}
  }

  // prisma frustratingly doesn't export or provide flexible enough types of its client to enable easy creation of
  // useful + type-safe reusable/generic helpers... hoping in future releases...
  //
  // buildSelectFields<PrismaType extends object>(fieldNames: (keyof PrismaType)[]) {
  //   Prisma.validator<PrismaType>()(
  //     fieldNames.reduce((acc, fieldName) => ({ ...acc, [fieldName]: true }), {} as unknown as any),
  //   )
  // }
}
