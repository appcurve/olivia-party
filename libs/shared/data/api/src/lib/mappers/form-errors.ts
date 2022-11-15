import type { CriteriaMode, ErrorOption } from 'react-hook-form'
import type { ApiValidationErrorGenericResponseDto } from '../schemas/errors/validation-errors'

/**
 * Map a form validation error response from the project API to a data type more suitable for use with
 * react-hook-form: an array of tuples corresponding to `[fieldName, ErrorOption]`.
 *
 * This function only maps the `error.fields` property and ignores `error.general` from the server's response.
 *
 * Set `options?.criteriaMode` based on the value provided to the `useForm()` hook. Option 'all' populates
 * `ErrorOption.types` and supports displaying multiple errors per field, whereas the default 'firstError'
 * will populate `ErrorOption.type` and the form will only support one error per field at a time.
 *
 * Note that react-hook-form supports setting errors that are not associated with an input field however
 * these will persist until they are cleared by calling `clearErrors()`.
 */
export function mapApiValidationErrorToHookForm<DTO extends Record<string, unknown>>(
  error: ApiValidationErrorGenericResponseDto<DTO> | undefined,
  options?: {
    criteriaMode?: CriteriaMode
  },
): [keyof DTO, ErrorOption][] {
  if (!error || !error.fields) {
    return []
  }

  // handle case for setting `ErrorOptions.types: MultipleFieldErrors` (typing of value is ~ `Record<type, message>`)
  if (options?.criteriaMode === 'all') {
    return Object.keys(error.fields ?? {}).map((name) => {
      // potential to overwrite the object value when there are duplicate codes is not a concern for this use-case
      const types: ErrorOption['types'] = error.fields[name as keyof DTO]?.reduce(
        (acc: Record<string, string>, { code, message }) => {
          acc[code] = message
          return acc
        },
        {},
      )

      if (!types) {
        return [name, { message: 'Invalid value' }]
      }

      return [name, { types }]
    })
  }

  // handle default case for setting `ErrorOptions.type`
  return Object.keys(error.fields ?? {}).flatMap(
    (name) => error.fields[name as keyof DTO]?.map(({ code, message }) => [name, { type: code, message }]) ?? [],
  ) as [keyof DTO, ErrorOption][]
}
