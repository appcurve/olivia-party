import type { FieldValues, FormState, UseFormRegister } from 'react-hook-form'

export interface HookFormComponentProps<DTO extends FieldValues> {
  register?: UseFormRegister<DTO>
  formState?: FormState<DTO>

  // errors?: FieldErrors // retrieve from formState
}
