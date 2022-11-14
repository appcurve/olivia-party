import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus } from '@nestjs/common'
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util'
import { Schema } from 'zod'
import { buildRequestValidationErrorApiDto } from './zod-dto-validation-pipe'

/**
 * Custom validation pipe that validates unknown input data by parsing it with the zod schema
 * provided as an argument to its constructor. Throws an error if data is invalid.
 *
 * Intended to facilitate ad-hoc schema validation of request data.
 *
 * For most use-cases you should use `ZodSchemaValidationPipe` which should be added as a global
 * provider per the configuration of `AppModule`.
 *
 * ```ts
 * @Body(new ZodSchemaValidationPipe(zExampleSchema)) example: Example
 * ```
 *
 * Added as a feature when implementing the very closely related ZodDtoValidationPipe()
 * @todo QA/testing required prior to use.
 *
 * @see ZodDtoValidationPipe
 */
@Injectable()
export class ZodSchemaValidationPipe implements PipeTransform {
  private errorHttpStatusCode: keyof typeof HttpErrorByCode

  constructor(private readonly schema: Schema, errorHttpStatusCode?: keyof typeof HttpErrorByCode) {
    this.errorHttpStatusCode = errorHttpStatusCode ?? HttpStatus.UNPROCESSABLE_ENTITY
  }

  transform(data: unknown, _metadata: ArgumentMetadata): unknown {
    const parseResult = this.schema.safeParse(data)

    if (!parseResult.success) {
      const responseDto = buildRequestValidationErrorApiDto(parseResult.error)
      throw new HttpErrorByCode[this.errorHttpStatusCode](responseDto)
    }

    return parseResult.data
  }
}
