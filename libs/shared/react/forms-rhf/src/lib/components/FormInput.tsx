import React, { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

import { useMergedRef } from '@firx/react-hooks'
import type { FormElementCommonProps } from '../types/form-element-common-props.interface'
import { FormInputErrors } from './input-parts/FormInputErrors'
import { FormInputHelperText } from './input-parts/FormInputHelperText'
import { FormInputLabel } from './input-parts/FormInputLabel'

export interface FormInputProps extends Omit<React.ComponentPropsWithRef<'input'>, 'name'>, FormElementCommonProps {
  /**
   * Input `type` attribute e.g. _text_, _email_, _password_, _search_. Default: _text_.
   */
  type?: React.HTMLInputTypeAttribute
}

/**
 * Form input component for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed foundation for this component.
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    id,
    name,
    label,
    helperText,
    type = 'text',
    readOnly = false,
    hideErrorMessage = false,
    hideLabel = false,
    appendClassName,
    validationOptions,
    ...restProps
  }: FormInputProps,
  forwardedRef,
) {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext()

  const safeId = useId()
  const componentId = id ?? safeId

  const { ref: formRef, ...registerProps } = register(name, validationOptions)
  const mergedRef = useMergedRef(forwardedRef, formRef)

  const isInputDisabled = restProps.disabled || isSubmitting

  return (
    <div
      className={clsx(
        'group',
        {
          'opacity-80': restProps.disabled,
        },
        appendClassName,
      )}
    >
      <FormInputLabel htmlFor={componentId} label={label} hideLabel={hideLabel} />
      <div className="relative">
        <input
          ref={mergedRef}
          id={componentId}
          disabled={isInputDisabled}
          placeholder={restProps.placeholder ?? label}
          {...registerProps}
          {...restProps}
          type={type}
          readOnly={readOnly}
          className={clsx(
            // keep an eye out for of css selector specificity issues with fx classes vs tailwind + forms
            'block w-full rounded-md',
            'border rounded-md text-P-form-input-text placeholder:text-P-form-placeholder',
            'focus:outline-none focus:ring-2 transition-colors', // similar to .fx-focus-ring-form
            readOnly || isInputDisabled
              ? 'bg-P-neutral-100 cursor-default' // focus:ring-0 focus:border-P-neutral-300
              : 'bg-white',
            {
              'animate-pulse cursor-progress': isSubmitting,

              // editable field - no error case
              'border-P-form-input-border focus:border-P-form-input-border focus:ring-P-sky-100':
                !readOnly && !errors[name],

              // editable field - error case
              'border-P-error-300 focus:border-P-error-200 focus:ring-P-error-100': !readOnly && errors[name],
            },
          )}
          aria-label={hideLabel ? label : undefined}
          aria-invalid={errors[name] ? 'true' : 'false'}
        />
        {errors[name] && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-P-error-500" aria-hidden />
          </div>
        )}
      </div>
      <FormInputHelperText text={helperText} />
      <FormInputErrors errors={errors} name={name} show={!hideErrorMessage} />
    </div>
  )
})
