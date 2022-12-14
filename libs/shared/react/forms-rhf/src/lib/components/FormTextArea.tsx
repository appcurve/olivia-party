import React, { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

import { useMergedRef } from '@firx/react-hooks'
import type { FormElementCommonProps } from '../types/form-element-common-props.interface'
import { FormInputHelperText } from './input-parts/FormInputHelperText'
import { FormInputErrors } from './input-parts/FormInputErrors'

export interface FormTextAreaProps
  extends Omit<React.ComponentPropsWithRef<'textarea'>, 'name'>,
    FormElementCommonProps {}

/**
 * Form textarea (textbox) for use with react-hook-form.
 * Forms that use this component must be wrapped in `<FormProvider>..</FormProvider>`
 *
 * Thanks to `@theodorusclarence` for the MIT-licensed start of this component (since heavily revised).
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 */
export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(function TextArea(
  {
    id,
    name,
    label,
    placeholder = '',
    helperText,
    readOnly = false,
    hideLabel = false,
    hideErrorMessage = false,
    appendClassName,
    validationOptions,
    ...restProps
  },
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

  return (
    <div className={clsx('group', appendClassName)}>
      <label htmlFor={id} className={clsx(hideLabel ? 'sr-only' : 'fx-form-label mb-1')}>
        {label}
      </label>
      <div className="relative mt-1 text-left">
        <textarea
          ref={mergedRef}
          id={componentId}
          disabled={restProps.disabled || isSubmitting}
          {...registerProps}
          rows={3} // default to be overridden by `...restProps` if a value is provided
          {...restProps}
          readOnly={readOnly}
          placeholder={placeholder}
          className={clsx(
            'block w-full rounded-md',
            'border rounded-md border-P-form-input-border text-P-form-input-text placeholder:text-P-form-placeholder',
            'focus:outline-none focus:border-P-form-input-border focus:ring-2 focus:ring-P-sky-100', // fx-focus-ring-form
            readOnly
              ? 'bg-P-neutral-100 focus:ring-0 cursor-not-allowed border-P-neutral-300 focus:border-P-neutral-300'
              : errors[name]
              ? 'focus:ring-P-error-500 border-P-error-500 focus:border-P-error-500'
              : 'fx-focus-ring-form', // focus:ring-primary-500 border-P-neutral-300 focus:border-primary-500
            'block w-full rounded-md shadow-sm',
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
