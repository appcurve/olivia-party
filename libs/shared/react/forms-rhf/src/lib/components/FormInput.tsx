import React, { useId, useMemo } from 'react'
import clsx from 'clsx'
import type { FieldValues, Path, RegisterOptions } from 'react-hook-form'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

import type { FormElementCommonProps } from '../types/form-element-common-props.interface'
import type { HookFormComponentProps } from '../types/hook-form-component-props.interface'
import { Input, type InputProps } from './elements/Input'
import { FormInputErrors } from './input-parts/FormInputErrors'
import { FormInputHelperText } from './input-parts/FormInputHelperText'
import { FormInputLabel } from './input-parts/FormInputLabel'

export interface FormInputProps<DTO extends FieldValues>
  extends Omit<InputProps, 'name'>,
    FormElementCommonProps,
    HookFormComponentProps<DTO> {
  name: string | Path<DTO>
}

/**
 * Inner component of `FormInput` for a generic DTO/FieldValues and integrated with react-hook-form.
 * If used as a child of a `Form` component the `register` + `formState` props will be be added by `Form`.
 *
 * @see FormInput
 * @see Form
 */
function FormInputComponent<DTO extends FieldValues>(
  {
    id,
    name,
    type = 'text',
    label,
    helperText,
    isLoading = false,
    showErrorMessage = true,
    showLabel = true,
    register,
    formState,
    validationRules,
    appendClassName,
    ...restProps
  }: React.PropsWithRef<FormInputProps<DTO>>,
  ref: React.ForwardedRef<HTMLInputElement>,
): JSX.Element {
  const safeId = useId()
  const componentId = id ?? safeId
  const errorMessageId = `${componentId}:error`

  const hasValidationErrors = !!(formState?.errors && formState.errors[name])
  const registerOptions: RegisterOptions = useMemo(
    () => ({
      valueAsNumber: type === 'number',
      ...validationRules,
    }),
    [type, validationRules],
  )

  if (process.env['NODE_ENV'] !== 'production' && typeof register !== 'function') {
    console.warn(`FormInput ${name} missing register function.`)
  }

  return (
    <div
      className={clsx(
        'group flex flex-col space-y-1',
        {
          'opacity-80': restProps.disabled,
        },
        appendClassName,
      )}
    >
      <FormInputLabel htmlFor={componentId} label={label} showLabel={showLabel} />
      <div className="relative">
        <Input
          ref={ref}
          id={componentId}
          type={type}
          {...restProps}
          {...(register && register(name as Path<DTO>, registerOptions))} // @future improve type for RHF's dot-access
          disabled={restProps.disabled || isLoading}
          aria-label={showLabel ? undefined : label}
          aria-invalid={hasValidationErrors}
          aria-errormessage={errorMessageId}
        />
        {hasValidationErrors && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-P-error-500" aria-hidden />
          </div>
        )}
      </div>
      <FormInputHelperText text={helperText} />
      <FormInputErrors id={errorMessageId} name={name} errors={formState?.errors} showErrorMessage={showErrorMessage} />
    </div>
  )
}

/**
 * Form input component for use with react-hook-form.
 *
 * Use with a parent `Form` component to automatically manage the react-hook-form integration and automatically
 * provide the `register` and `formState` props.
 *
 * Reimplemented from an earlier take that relied on `useFormContext()` and `<FormProvider>..</FormProvider>`
 * due to regression annoyances with context + react-hook-form following package updates (see the library's proxy
 * implementation).
 *
 * @see {@link https://react-hook-form.com/api/useformcontext}
 * @see Form
 */
export const FormInput = React.forwardRef(FormInputComponent) as <DTO extends FieldValues>(
  props: FormInputProps<DTO> & { ref?: React.ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof FormInputComponent>
