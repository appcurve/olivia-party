import React, { useCallback, useState } from 'react'
import { DeepPartial, FormProvider, Path, useForm } from 'react-hook-form'
import type { SubmitHandler, UseFormProps, FormState, UseFormRegister, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodTypeAny } from 'zod'

import { ConflictError, FormError } from '@firx/react-fetch'
import { mapApiValidationErrorToHookForm } from '@firx/op-data-api'
import { FormButton } from './FormButton'
import { FormContainer } from './FormContainer'

export type FormPassThroughProps<DTO extends FieldValues> = {
  formState: FormState<DTO> | undefined
  register: UseFormRegister<DTO> | undefined
}

export type Field<T> = React.ReactElement<{ [key: string]: unknown } & { name?: keyof T }>

export interface FormProps<DTO extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<'form'>, 'defaultValue' | 'onSubmit'> {
  className?: string
  children: Field<DTO> | Field<DTO>[]
  options?: UseFormProps<DTO>
  id?: string
  schema?: ZodTypeAny
  layout?: 'none' | 'contained'
  defaultValues?: DeepPartial<DTO> | undefined
  submitCaption?: string
  showSubmitButton?: boolean
  onSubmitForm: SubmitHandler<DTO>

  // consider: passing setError/clearErrors functions back to caller to enable fine-tuning UX
  // | ((values: FV, setError: UseFormSetError<FV>, clearErrors: UseFormClearErrors<FV>) => Promise<void>)
  // | ((values: FV, setError: UseFormSetError<FV>, clearErrors: UseFormClearErrors<FV>) => void)
}

const FormContainerLayout: React.FC<React.PropsWithChildren<{ layout: FormProps<FieldValues>['layout'] }>> = ({
  layout,
  children,
}) => {
  if (layout === 'none') {
    // eslint-disable-next-line react/jsx-no-useless-fragment -- fragment required for jsx/tsx typing
    return <>{children}</>
  }

  return <FormContainer>{children}</FormContainer>
}

const cloneFormInputs = (children: React.ReactNode, applyProps: Record<string, unknown>): React.ReactNode => {
  return React.Children.map<React.ReactNode, React.ReactNode>(children, (child) => {
    if (!React.isValidElement(child)) {
      return child
    }

    // case: form input component with a `name` prop
    if (child.props.name) {
      return React.cloneElement(child, applyProps)
    }

    // recursive case: non-form-input component with nested children
    if (child.props.children) {
      const props = {
        children: cloneFormInputs(child.props.children, applyProps),
      }

      return React.cloneElement(child, props)
    }

    return React.cloneElement(child)
  })
}

export const Form = <DTO extends FieldValues = Record<string, unknown>>({
  id,
  children,
  className,
  options,
  schema,
  defaultValues,
  submitCaption = 'Save',
  layout = 'contained',
  showSubmitButton = true,
  onSubmitForm,
  ...restFormProps
}: React.PropsWithChildren<FormProps<DTO>>): JSX.Element => {
  // use local state for form-wide error/notice messages (vs. [mis]using a non-associated input field name)
  // this also persists important user feedback past re-validation by react-hook-form e.g. in case of ConflictError
  const [formError, setFormError] = useState<string | undefined>(undefined)

  const hookForm = useForm<DTO>({
    ...options,
    resolver: schema && zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, setError, reset } = hookForm
  const fieldProps: FormPassThroughProps<DTO> = {
    register: hookForm?.register,
    formState: hookForm?.formState,
  }

  const handleSubmitForm: SubmitHandler<DTO> = useCallback(
    async (formValues) => {
      try {
        setFormError(undefined)
        await onSubmitForm(formValues) // consider passing setError + clearErrors back to caller

        // only reset after successful submit (do not reset form values if there's an error)
        reset()
      } catch (error: unknown) {
        if (error instanceof FormError) {
          setFormError(error.getData()?.general.join('; '))

          mapApiValidationErrorToHookForm<DTO>(error.getData(), { criteriaMode: 'all' }).forEach(([name, err]) =>
            setError(name, err),
          )

          return
        }

        if (error instanceof ConflictError) {
          if ('email' in formValues && error.message.includes(String(formValues['email']))) {
            setError('email' as Path<DTO>, { types: { conflict: error.message } })
          }

          setFormError(error.message)
          return
        }
      }
    },
    [reset, setError, onSubmitForm],
  )

  return (
    <FormContainerLayout layout={layout}>
      <FormProvider<DTO> {...hookForm}>
        {formError && (
          <div className="bg-P-error-50 text-P-neutral-700/90 rounded-md p-4 text-left my-4">{formError}</div>
        )}
        <form
          id={id}
          autoComplete="off"
          autoCorrect="off"
          className={className}
          onSubmit={handleSubmit(handleSubmitForm)}
          {...restFormProps}
        >
          {cloneFormInputs(children, fieldProps)}
          {showSubmitButton && (
            <div>
              <FormButton type="submit" scheme="dark" appendClassName="mt-6">
                {submitCaption}
              </FormButton>
            </div>
          )}
        </form>
      </FormProvider>
    </FormContainerLayout>
  )
}
