import { Form, FormInput } from '@firx/react-forms-rhf'
import { SignInDto, zSignIn } from '@firx/op-data-api'

export interface SignInFormProps {
  /**
   * Prefill the user's email as a convenience in cases where it is known.
   */
  email?: string
  onSignInAsync: (formValues: SignInDto) => Promise<void>
}

const defaultValues: SignInDto = {
  email: '',
  password: '',
}

const LABELS = {
  EMAIL_ADDRESS: 'Email Address',
  PASSWORD: 'Password',
  SIGN_IN: 'Sign In',
}

export const SignInForm: React.FC<SignInFormProps> = ({ email, onSignInAsync }) => {
  return (
    <Form
      onSubmitForm={onSignInAsync}
      defaultValues={email ? { ...defaultValues, email } : defaultValues}
      schema={zSignIn}
      renderContainer={false}
    >
      <div className="space-y-2">
        <FormInput
          name="email"
          label={LABELS.EMAIL_ADDRESS}
          placeholder={LABELS.EMAIL_ADDRESS}
          hideLabel
          validationOptions={{ required: true, pattern: /.+@.+/ }}
        />

        <FormInput
          type="password"
          name="password"
          label={LABELS.PASSWORD}
          placeholder={LABELS.PASSWORD}
          hideLabel
          validationOptions={{ required: true }}
        />
      </div>
    </Form>
  )
}
