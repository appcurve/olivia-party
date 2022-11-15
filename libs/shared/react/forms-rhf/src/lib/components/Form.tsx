import React, { useCallback } from 'react'
import {
  type FieldValues,
  FormProvider,
  useForm,
  type UseFormReturn,
  type UseFormProps,
  type UseFormSetError,
  SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodTypeAny } from 'zod'
import { FormContainer } from './FormContainer'
import { FormButton } from './FormButton'

export interface FormProps<FV extends FieldValues, TC = unknown> extends React.ComponentPropsWithRef<'form'> {
  schema?: ZodTypeAny
  useFormProps?: UseFormProps<FV, TC>
  renderContainer?: boolean
  renderSubmitButton?: boolean
  onSubmitForm:
    | ((values: FV, setError: UseFormSetError<FV>) => Promise<void>)
    | ((values: FV, setError: UseFormSetError<FV>) => void)
}

type Noop = () => void

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: Noop = () => {}

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
 * @wip incremental progress towards a common Form wrapper for react-hook-form
 * @todo add server-side api error display per approach in RegisterForm
 * @todo complete common Form wrapper and refactor other forms to use it
 */
export function Form<FV extends FieldValues, TC = unknown>({
  children,
  schema,
  useFormProps,
  renderContainer = true,
  renderSubmitButton = true,
  onSubmitForm,
  ...restFormProps
}: React.PropsWithChildren<FormProps<FV, TC>>): JSX.Element {
  const hookForm: UseFormReturn<FV, TC> = useForm<FV, TC>({
    criteriaMode: 'all',
    ...(schema ? { resolver: zodResolver(schema) } : {}),
    ...(useFormProps || {}),
  })

  const { reset, setError, handleSubmit } = hookForm

  // handle submit -- do not reset form values in error conditions
  const handleSubmitForm: SubmitHandler<FV> = useCallback(
    async (formValues) => {
      try {
        await onSubmitForm(formValues, setError)
        reset()
      } catch (error: unknown) {
        // @todo add diplay of server validation errors per approach evolved from that tested out with the RegisterForm

        // this is actually the same as how react-query internally discards rejections with sync `mutate()`
        // if using sync `mutate()` with react-query remember to set a global onError fallback
        noop()
      }
    },
    [reset, setError, onSubmitForm],
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
