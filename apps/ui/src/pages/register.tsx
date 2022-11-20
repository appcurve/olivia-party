import type { NextPage } from 'next'

import { useAuthRegisterQuery } from '../api/hooks/auth'
import { PageHeading } from '../components/elements/headings/PageHeading'
import { RegisterForm } from '../components/prefabs/RegisterForm'

export const RegisterPage: NextPage = (_props) => {
  const { mutateAsync: authRegisterAsync } = useAuthRegisterQuery()

  return (
    <>
      <PageHeading>Register</PageHeading>
      <RegisterForm
        onSaveAsync={async (formValues): Promise<void> => {
          await authRegisterAsync(formValues, {
            onSuccess: () => alert('yay'),
          })
        }}
      />
    </>
  )
}

export default RegisterPage
