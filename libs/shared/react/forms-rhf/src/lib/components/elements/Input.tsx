import clsx from 'clsx'
import React from 'react'

export interface InputProps extends React.ComponentPropsWithRef<'input'> {
  id?: string
  isLoading?: boolean
  appendClassName?: string
}

/**
 * Styled form input component that forwards ref and props to the underlying input element.
 * Renders with conditional error styling per the value of the `aria-invalid` attribute.
 */
export const Input: React.FC<InputProps> = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, ...restInputProps },
  forwardedRef,
) {
  return (
    <input
      id={id}
      ref={forwardedRef}
      type={restInputProps.type ?? 'text'}
      className={clsx(
        // reminder: keep an eye out for of css specificity issues w/ fx classes vs. tailwind + forms plugin
        'block w-full border rounded-md',
        'bg-white text-P-form-input-text placeholder:text-P-form-placeholder',
        'disabled:bg-P-neutral-100 disabled:text-P-neutral-300 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 transition-colors', // similar to .fx-focus-ring-form in presets
        'focus:outline-none focus:border-P-sky-200 focus:ring-2 focus:ring-P-sky-200/50',
        {
          // editable field: default case
          'border-P-form-input-border focus:border-P-form-input-border focus:ring-P-sky-100':
            !restInputProps['aria-invalid'],

          // editable field: error case
          'border-P-error-300 focus:border-P-error-200 focus:ring-P-error-200/50': !!restInputProps['aria-invalid'],
        },
      )}
      {...restInputProps}
    />
  )
})
