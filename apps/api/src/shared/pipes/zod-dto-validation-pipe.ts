import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus, Optional, Logger } from '@nestjs/common'
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util'
import { ZodDtoStatic } from '@anatine/zod-nestjs'
import type { ZodError, ZodIssue } from 'zod'

import { RequestValidationErrorApiDto } from '../dto/validation-errors.api-dto'

export interface ZodDtoValidationPipeOptions {
  errorHttpStatusCode?: keyof typeof HttpErrorByCode
}

/**
 * Transform a `ZodError` from a failed `safeParse()` operation to a `RequestValidationErrorApiDto`.
 *
 * For reference: the implementation from @anatine/zod-nestjs ZodValidationPipe isn't ideal for front-end use-cases:
 *
 * ```ts
 * const { error } = parseResult
 * const response = error.errors.map((error) => `${error.path.join('.')}: ${error.message}`)
 * ```
 *
 * The following implementation is similar in behavior to zod's flatten() and somewhat similar to format():
 *
 * ```ts
 * const response = parseResult.error.flatten()
 * const response = parseResult.error.format()
 * ```
 *
 * @see RequestValidationErrorApiDto
 */
export function buildRequestValidationErrorApiDto(error: ZodError<unknown>): RequestValidationErrorApiDto {
  return error.errors.reduce(
    (acc, issue: ZodIssue) => {
      const field = issue.path.length > 0 ? issue.path.join('.') : undefined

      if (!field) {
        acc.general.push({
          code: issue.code,
          message: issue.message,
        })

        return acc
      }

      // push to existing array for the current field if it exists otherwise initialize it
      if (acc.fields[field]) {
        acc.fields[field].push({
          code: issue.code,
          message: issue.message,
        })
      } else {
        acc.fields[field] = [
          {
            code: issue.code,
            message: issue.message,
          },
        ]
      }

      return acc
    },
    { general: [], fields: {} } as RequestValidationErrorApiDto,
  )
}

/**
 * Customized version of `ZodValidationPipe` from '@anatine/zod-nestjs' that improves the formatting of the erro
 * response for integration with form libraries on the front-end UI such as react-hook-form.
 *
 * This pipe must be used in conjunction with DTO classes created from zod schemas using `createZodDto()`
 * from `@anatine/zod-nestjs` in order for the zod schema to be available as part of the request's `ArgumentMetadata`.
 *
 * Returns a response using zod's `format()` helper.
 *
 * Also see zod's `flatten()` helper which returns .NET Core-like errors; it is not used in this implementation
 * due to risk of property collision in nested forms.
 *
 * @see {@link https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md}
 */
@Injectable()
export class ZodDtoValidationPipe implements PipeTransform {
  private readonly logger = new Logger(this.constructor.name)
  private readonly errorHttpStatusCode: keyof typeof HttpErrorByCode

  constructor(@Optional() options?: ZodDtoValidationPipeOptions) {
    this.errorHttpStatusCode = options?.errorHttpStatusCode || HttpStatus.UNPROCESSABLE_ENTITY
  }

  public transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const zodSchema = (metadata?.metatype as ZodDtoStatic | undefined)?.zodSchema

    if (zodSchema) {
      const parseResult = zodSchema.safeParse(value)

      if (!parseResult.success) {
        const responseDto = buildRequestValidationErrorApiDto(parseResult.error)
        throw new HttpErrorByCode[this.errorHttpStatusCode](responseDto)
      }

      return parseResult.data
    }

    this.logger.warn(
      'Skipping Request Validation: ZodDtoValidationPipe invoked with no zod schema available in ArgumentMetadata',
    )

    return value
  }
}
