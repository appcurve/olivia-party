import {
  HttpStatus,
  UnprocessableEntityException,
  type ValidationPipeOptions,
  type ValidationError,
} from '@nestjs/common'

/**
 * Configuration options for NestJS' `ValidationPipe` to pass to its constructor that set project preferences for
 * transformation, validation, and ensure validation failures return response code 422 with desired response body.
 */
export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true, // strip validated object of properties that are not class properties w/ validation decorators
  transform: true, // enable class-transformer to transform js objects to classes via `plainToClass()` (use with `@Type()` decorator)
  transformOptions: {
    enableImplicitConversion: false,
  },
  forbidNonWhitelisted: true, // throw if an unrecognized property is received
  forbidUnknownValues: true, // recommended per class-validator npm page
  // disableErrorMessages: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]): UnprocessableEntityException =>
    new UnprocessableEntityException({
      message: 'Unprocessable Entity',
      errors: errors.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.property]: Object.values(curr.constraints ?? {}).join(', '),
        }),
        {},
      ),
    }),
}
