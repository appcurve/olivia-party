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

  // prisma frustratingly doesn't export or provide flexible enough types of its client to enable easy creation of
  // useful + type-safe reusable/generic helpers... hoping in future releases...
  //
  // buildSelectFields<PrismaType extends object>(fieldNames: (keyof PrismaType)[]) {
  //   Prisma.validator<PrismaType>()(
  //     fieldNames.reduce((acc, fieldName) => ({ ...acc, [fieldName]: true }), {} as unknown as any),
  //   )
  // }
}
