import { Form, FormInput, type HookFormComponentProps } from '@firx/react-forms-rhf'
import { SignInDto, zSignIn } from '@firx/op-data-api'
import { useMemo } from 'react'

export interface SignInFormProps extends HookFormComponentProps<SignInDto> {
  /** Pre-fill email as a convenience in cases where it may be known. */
  email?: string
  onSignInAsync: (formValues: SignInDto) => Promise<void>
}

const LABELS = {
  EMAIL_ADDRESS: 'Email Address',
  PASSWORD: 'Password',
  SIGN_IN: 'Sign In',
}

export const SignInForm: React.FC<SignInFormProps> = ({ email, onSignInAsync }) => {
  const defaultValues: SignInDto = useMemo(
    () => ({
      email: email || '',
      password: '',
    }),
    [email],
  )

  return (
    <Form onSubmitForm={onSignInAsync} defaultValues={defaultValues} schema={zSignIn} layout="none">
      <div className="space-y-2">
        <FormInput<SignInDto>
          name="email"
          label={LABELS.EMAIL_ADDRESS}
          placeholder={LABELS.EMAIL_ADDRESS}
          showLabel={false}
        />

        <FormInput<SignInDto>
          name="password"
          type="password"
          label={LABELS.PASSWORD}
          placeholder={LABELS.PASSWORD}
          showLabel={false}
        />
      </div>
    </Form>
  )
}
