import React, { useCallback } from 'react'
import {
  FormProvider,
  useForm,
  type FieldValues,
  type UseFormReturn,
  type UseFormProps,
  type UseFormSetError,
  type SubmitHandler,
  type DeepPartial,
  UseFormClearErrors,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodTypeAny } from 'zod'
import { FormContainer } from './FormContainer'
import { FormButton } from './FormButton'
import { FormError } from '@firx/react-fetch'
import { mapApiValidationErrorToHookForm } from '@firx/op-data-api'

export interface FormProps<FV extends FieldValues, TC = unknown>
  extends Exclude<React.ComponentPropsWithRef<'form'>, 'defaultValue'> {
  schema?: ZodTypeAny
  useFormProps?: UseFormProps<FV, TC>
  defaultValues?: DeepPartial<FV>
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
 *
 * @wip incremental progress towards a common Form wrapper for react-hook-form
 * @todo add server-side api error display per approach in RegisterForm
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
  const hookForm: UseFormReturn<FV, TC> = useForm<FV, TC>({
    criteriaMode: 'all',
    defaultValues,
    ...(schema ? { resolver: zodResolver(schema) } : {}),
    ...(useFormProps || {}),
  })

  const { reset, setError, clearErrors, handleSubmit } = hookForm

  const handleSubmitForm: SubmitHandler<FV> = useCallback(
    async (formValues) => {
      try {
        await onSubmitForm(formValues, setError, clearErrors)

        // only auto-reset the form in the try{} block (i.e. do not reset form values in error conditions)
        reset()
      } catch (error: unknown) {
        if (error instanceof FormError) {
          mapApiValidationErrorToHookForm<FV>(error.getData(), { criteriaMode: 'all' }).forEach(([name, err]) =>
            setError(name, err),
          )

          return
        }

        // see doc comment of function on handling...
        // noop() // note: with commented out, NetworkError's and the like will bubble up as unhandled.
      }
    },
    [reset, setError, clearErrors, onSubmitForm],
  )

  return (
    <FormProvider<FV, TC> {...hookForm}>
      <form autoComplete="off" autoCorrect="off" onSubmit={handleSubmit(handleSubmitForm)} {...restFormProps}>
        {renderContainer ? (
          <FormContainer>
            {children}
            <ConditionalSubmitButton show={renderSubmitButton} />
          </FormContainer>
        ) : (
          <>
            {children}
            <ConditionalSubmitButton show={renderSubmitButton} />
          </>
        )}
      </form>
    </FormProvider>
  )
}
