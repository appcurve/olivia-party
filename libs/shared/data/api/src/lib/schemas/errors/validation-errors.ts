import { z, ZodError } from 'zod'

export const zValidationError = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
})

export const zValidationErrors = z.record(z.string().min(1), z.array(zValidationError))

export const zRequestValidationError = z.object({
  general: z.array(zValidationError),
  fields: zValidationErrors,
})

/**
 * Single validation issue/error related to server-side data/forms validation.
 */
export interface ValidationErrorDto extends z.infer<typeof zValidationError> {}

/**
 * Record object that contains server-side data/form validation errors related to a given request DTO.
 * Keys are property/field names and values are arrays of `ValidationErrorDto`'s.
 */
export interface ValidationErrorsDto extends z.infer<typeof zValidationErrors> {}

/**
 * General non-generic interface that describes the error response body from project API's that result
 * from data/forms validation errors (HTTP status 422).
 *
 * @see ApiValidationErrorGenericResponseDto interface for a generic version vs. request DTO's.
 * @see FormError
 */
export interface RequestValidationErrorDto extends z.infer<typeof zRequestValidationError> {}

/**
 * Generic interface companion to the non-generic `RequestValidationErrorDto`: the generic argument is
 * the request DTO.
 *
 * This interface provides tighter field-level typing of 422 error responses from project API's related to
 * server-side validation of form/data of a given request DTO.
 *
 * This separate definition exists because zod's `record()` produces a type that doesn't quite jive with
 * partial/keyof-records, plus the library is not necessarily suited for all use-cases with generics.
 *
 * @see RequestValidationErrorDto for the companion non-generic zod type corresponding to this interface
 */
export interface ApiValidationErrorGenericResponseDto<DTO extends Record<string, unknown>> {
  general: ValidationErrorDto[]
  fields: { [P in keyof DTO]?: ValidationErrorDto[] }
}

/**
 * Type guard that evaluates if the input is a `RequestValidationErrorDto`.
 *
 * Note the `RequestValidationErrorDto` interface is high-level and describes the common shape of the
 * API error response for form validation errors. Therefore this guard does not validate that the errors
 * themselves are valid vs. any individual request DTO.
 *
 * @see RequestValidationErrorDto
 * @see ApiValidationErrorGenericResponseDto
 */
export const isRequestValidationErrorDto = (input: unknown): input is RequestValidationErrorDto => {
  try {
    zRequestValidationError.parse(input)
    return true
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return false
    }

    throw error
  }
}
