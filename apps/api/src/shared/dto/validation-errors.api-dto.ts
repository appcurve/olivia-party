import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { zValidationError, zValidationErrors, zRequestValidationError } from '@firx/op-data-api'

export const zValidationErrorApiDto = extendApi(zValidationError, {
  title: 'Form field/value validation error DTO.',
  description: 'Response DTO that describes a single validation issue with a request body or field.',
})

export const zValidationErrorsApiDto = extendApi(zValidationErrors, {
  title: 'Response DTO of a Record object of form validation errors.',
  description:
    "Record object of ValidationErrorApiDto's. When describing form errors keys correspond to individual fields.",
})

export const zRequestValidationErrorApiDto = extendApi(zRequestValidationError, {
  title: 'RequestValidationErrorApiDto',
  description: `
    Response DTO returned for invalid POST/PATCH requests related to the 422 Unprocessable Entity response status.
    Applicable to form data that fails server-side validation.
  `,
})

export class ValidationErrorApiDto extends createZodDto(zValidationErrorApiDto) {}
export class ValidationErrorsApiDto extends createZodDto(zValidationErrorsApiDto) {}
export class RequestValidationErrorApiDto extends createZodDto(zRequestValidationErrorApiDto) {}
