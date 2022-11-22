import React, { useCallback, useEffect, useState } from 'react'
import {
  FormProvider,
  useForm,
  type FieldValues,
  type UseFormReturn,
  type UseFormProps,
  type UseFormSetError,
  type SubmitHandler,
  type DeepPartial,
  type UseFormClearErrors,
  type Path,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodTypeAny } from 'zod'
import { FormContainer } from './FormContainer'
import { FormButton } from './FormButton'
import { FormError, ConflictError } from '@firx/react-fetch'
import { mapApiValidationErrorToHookForm } from '@firx/op-data-api'

export interface FormProps<FV extends FieldValues, TC = unknown>
  extends Exclude<React.ComponentPropsWithRef<'form'>, 'defaultValue'> {
  schema?: ZodTypeAny
  useFormProps?: UseFormProps<FV, TC>
  defaultValues?: DeepPartial<FV> // | (() => Promise<DeepPartial<FV>>)
  renderContainer?: boolean
  renderSubmitButton?: boolean

  /**
   * Callback to fire on form submission with the values.
   * Management functions for the form's error state are also passed back as a convenience.
   */
  onSubmitForm:
    | ((values: FV, setError: UseFormSetError<FV>, clearErrors: UseFormClearErrors<FV>) => Promise<void>)
    | ((values: FV, setError: UseFormSetError<FV>, clearErrors: UseFormClearErrors<FV>) => void)
}

export type Noop = () => void

/**
 * noop function.
 *
 * This may used to help swallow rejected promises from async operations in an implementation that is
 * similar to how react-query internally discards rejections when using synchronous `mutate()`.
 *
 * If using sync `mutate()` with react-query (and in general...) remember to set a global onError fallback.
 *
 * @todo move to fetch library
 *
 */ // eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop: Noop = () => {}

const ConditionalSubmitButton: React.FC<{ show: boolean }> = ({ show }) => {
  return show ? (
    <div>
      <FormButton type="submit" scheme="dark" appendClassName="mt-6">
        Save
      </FormButton>
    </div>
  ) : null
}

/**
 * Generic wrapper for project forms powered by react-hook-form.
 *
 * This component wraps the form in a `FormProvider` and `form` tag, plus configure and manages
 * react-hook-form per project conventions. Simply add any compatible input components that tap into
 * the library's `FormContext`.
 *
 * @future support async defaultValues or perhaps a mechanism for running an effect
 * @future related to above desire - provide a hook variant that also returns back some of the functions e.g. reset()
 *
 * @todo complete common Form wrapper and refactor other forms to use it
 */
export function Form<FV extends FieldValues, TC = unknown>({
  children,
  schema,
  useFormProps,
  defaultValues,
  renderContainer = true,
  renderSubmitButton = true,
  onSubmitForm,
  ...restFormProps
}: React.PropsWithChildren<FormProps<FV, TC>>): JSX.Element {
  // use local state for form-wide error/notice messages (vs. [mis]using a not-associated input field name)
  // this also persists important user feedback past re-validation by rhf e.g. in case of ConflictError
  const [formError, setFormError] = useState<string | undefined>(undefined)

  const hookForm: UseFormReturn<FV, TC> = useForm<FV, TC>({
    criteriaMode: 'all',
    defaultValues,
    // defaultValues: typeof defaultValues === 'object' ? defaultValues : undefined,
    ...(schema ? { resolver: zodResolver(schema) } : {}),
    ...(useFormProps || {}),
  })

  const { reset, setError, clearErrors, handleSubmit } = hookForm

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  // useEffect(() => {
  //   const getDefaultValues = async () => {
  //     const users = await fetchUsers()
  //     setUsers(users)
  //   }

  //   reset(defaultValues)
  // }, [reset, initialValues])

  const handleSubmitForm: SubmitHandler<FV> = useCallback(
    async (formValues) => {
      try {
        setFormError(undefined)
        await onSubmitForm(formValues, setError, clearErrors)

        // only auto-reset the form after successful submit; do not reset form values in error conditions
        reset()
      } catch (error: unknown) {
        if (error instanceof FormError) {
          setFormError(error.getData()?.general.join('; '))

          mapApiValidationErrorToHookForm<FV>(error.getData(), { criteriaMode: 'all' }).forEach(([name, err]) =>
            setError(name, err),
          )

          return
        }

        if (error instanceof ConflictError) {
          if ('email' in formValues && error.message.includes(String(formValues['email']))) {
            setError('email' as Path<FV>, { types: { conflict: error.message } })
          }

          setFormError(error.message)
          return
        }
      }
    },
    [reset, setError, clearErrors, onSubmitForm],
  )

  return (
    <FormProvider<FV, TC> {...hookForm}>
      <form autoComplete="off" autoCorrect="off" onSubmit={handleSubmit(handleSubmitForm)} {...restFormProps}>
        {renderContainer ? (
          <FormContainer>
            {formError && (
              <div className="bg-P-error-50 text-P-neutral-700/90 rounded-md p-4 text-left my-4">{formError}</div>
            )}
            {children}
            <ConditionalSubmitButton show={renderSubmitButton} />
          </FormContainer>
        ) : (
          <>
            {formError && (
              <div className="bg-P-error-50 text-P-neutral-700/90 rounded-md p-4 text-left my-4">{formError}</div>
            )}
            {children}
            <ConditionalSubmitButton show={renderSubmitButton} />
          </>
        )}
      </form>
    </FormProvider>
  )
}
