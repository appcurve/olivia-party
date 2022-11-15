import React from 'react'
import { ErrorMessage } from '@hookform/error-message'
import type { ValidateResult } from 'react-hook-form'

export interface FormInputErrorsProps extends Exclude<React.ComponentProps<typeof ErrorMessage>, 'render'> {
  /**
   * Optionally set to `false` to not render anything even when the corresponding input component
   * has an error. Default: `true`
   */
  show?: boolean
}

/**
 * Helper that returns a refined error message and handles potential cases given the broad typing
 * of `ValidationResult`'s in react-hook-form.
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

/** Trim + add a period '.' to the end of the input string if it doesn't already have one. */
const addPeriod = (text: string): string => text.trim().replace(/(?<!\.)$/, '.')

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
export const FormInputErrors: React.FC<FormInputErrorsProps> = ({ name, errors, show = true, ...restProps }) => {
  if (!show) {
    return null
  }

  return (
    <ErrorMessage
      name={name}
      errors={errors}
      {...restProps}
      render={({ message, messages }): JSX.Element | null =>
        message ? (
          <div className="text-sm pl-0.5 pt-1 text-P-error-600">
            <span role="alert">{addPeriod(message)}</span>
          </div>
        ) : messages ? (
          <ul className="text-sm list-none pl-0.5 pt-1 space-y-2 text-P-error-600">
            {Object.entries(messages).map(([type, message]) => (
              <li key={`${type}${message}`}>
                <span role="alert">{addPeriod(getRefinedErrorMessage(type, message))}</span>
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  )
}
