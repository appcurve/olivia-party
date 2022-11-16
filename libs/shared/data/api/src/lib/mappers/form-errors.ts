import type { CriteriaMode, ErrorOption, Path } from 'react-hook-form'
import type { ApiValidationErrorGenericResponseDto } from '../schemas/errors/validation-errors'

/**
 * Map a form validation error response from the project API to a data type more suitable for use with
 * react-hook-form: an array of tuples corresponding to `[fieldName, ErrorOption]`.
 *
 * The tuple values can be easily passed as arguments to react-hook-form's `setError()` function within
 * a form component or hook.
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
    // @future possible feature -- or leave it up to the Form implementation to handle if it chooses with the FormError
    // /*
    //  * Set `true` to include general errors that are not associated with the name of any particular form field.
    //  *
    //  * If included these errors are not automatically cleared by react-hook-form and will persist until cleared with
    //  * the `clearError()` function. Defaults to `false`.
    //  */
    // includeNonFieldErrors?: boolean

    /**
     * Set `criteriaMode` as passed to the form's `useForm()` hook that sets single vs. multiple errors per field.
     * Default is the same as react-hook-form: 'firstError' (single case).
     */
    criteriaMode?: CriteriaMode
  },
): [Path<DTO>, ErrorOption][] {
  // note: Path<DTO> was initially implemented as `keyof DTO`; revised for downstream compatibilty with `setError()`
  // the implementation of `Path` is interesting and eagerly collects all paths (including nested w/ '.' connector)

  // @future @todo it would be good to test this further with fieldArrays and more nested structures to confirm the
  // pathing approach of adding a dot and using item position for arrays as a segment perfectly agrees vs. react-hook-form

  if (!error || !error.fields) {
    return []
  }

  if (options?.criteriaMode === 'all') {
    // handle case for setting `ErrorOptions.types: MultipleFieldErrors` (typing of value is ~ `Record<type, message>`)
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
        return [name as Path<DTO>, { message: 'Invalid value' }]
      }

      return [name as Path<DTO>, { types }]
    })
  }

  // handle default case for setting `ErrorOptions.type`
  return Object.keys(error.fields ?? {}).flatMap(
    (name) => error.fields[name as keyof DTO]?.map(({ code, message }) => [name, { type: code, message }]) ?? [],
  ) as [Path<DTO>, ErrorOption][]
}
