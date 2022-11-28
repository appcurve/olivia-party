import React from 'react'
import { ErrorMessage } from '@hookform/error-message'
import type { ValidateResult } from 'react-hook-form'

export interface FormInputErrorsProps extends Exclude<React.ComponentProps<typeof ErrorMessage>, 'render'> {
  /**
   * Element id to apply to the error message.
   * This value should equal that of the associated input field's `aria-errormessage` value.
   */
  id?: string

  /**
   * Control conditional rendering of this component. Default: `true`
   */
  showErrorMessage?: boolean
}

/**
 * Helper input error message component that conditionally renders a lightly-formatted error message and handles
 * various potential cases given the broad typing react-hook-form's `ValidationResult`.
 */
const getRefinedErrorMessage = (type: string, message: ValidateResult): string => {
  const hasEmptyMessage = typeof message === 'boolean' || !message

  if (hasEmptyMessage) {
    if (type === 'required') {
      return 'Required field'
    }

    if (type === 'pattern') {
      return 'Invalid value'
    }

    return 'Invalid data value'
  }

  if (Array.isArray(message)) {
    return message.join('; ')
  }

  if (message === 'String must contain at least 1 character(s)') {
    return 'Required field'
  }

  return String(message)
}

/**
 * Trim input text and suffix with a period character `.` if there isn't one already.
 */
const addPeriodSuffix = (text: string): string => text.trim().replace(/(?<!\.)$/, '.')

/**
 * Render any errors corresponding to the form input component with the given `name` as a list.
 * Does not render if the target component has no errors.
 *
 * This component is suited for react-hook-forms configured with `criteriaMode: 'all'` to show all validation errors.
 *
 * Under-the-hood this component is a wrapper of `ErrorMessage` from `@hookform/error-message` that standardizes
 * the display of any corresponding `errors[name]` values.
 *
 * @see {@link https://react-hook-form.com/api/useformstate/errormessage/}
 */
export const FormInputErrors: React.FC<FormInputErrorsProps> = ({
  id,
  name,
  errors,
  showErrorMessage = true,
  ...restProps
}) => {
  if (!showErrorMessage) {
    return null
  }

  return (
    <ErrorMessage
      id={id}
      name={name}
      errors={errors}
      {...restProps}
      render={({ message, messages }): JSX.Element | null =>
        message ? (
          <div className="text-sm pl-0.5 text-P-error-600">
            <span role="alert">{addPeriodSuffix(message)}</span>
          </div>
        ) : messages ? (
          <ul className="text-sm list-none pl-0.5 space-y-1 text-P-error-600">
            {Object.entries(messages).map(([type, message]) => (
              <li key={`${type}${message}`}>
                <span role="alert">{addPeriodSuffix(getRefinedErrorMessage(type, message))}</span>
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  )
}
