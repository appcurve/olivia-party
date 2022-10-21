import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'

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
   * Return an object with either a `uuid` or `id` property with the value of the given identifier,
   * depending on the type of the identifier.
   *
   * This helper is for working with table schemas that feature dual unique identifiers: a serial
   * int and a string uuid.
   *
   * This object can form part of the `where` clause of prisma queries.
   */
  getIdentifierWhereCondition(identifier: string | number): { uuid: string } | { id: number } {
    switch (typeof identifier) {
      case 'string': {
        return { uuid: identifier }
      }
      case 'number': {
        return { id: identifier }
      }
      default: {
        throw new InternalServerErrorException(`Invalid identifier: '${identifier}'`)
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
