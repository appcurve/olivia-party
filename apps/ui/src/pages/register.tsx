import type { NextPage } from 'next'

import { useAuthRegisterQuery } from '../api/hooks/auth'
import { PageHeading } from '../components/elements/headings/PageHeading'
import { RegisterForm } from '../components/prefabs/RegisterForm'

export const RegisterPage: NextPage = (_props) => {
  const { mutateAsync: authRegisterAsync, ..._authRegisterQuery } = useAuthRegisterQuery({
    // onError: (error) => console.log('error debug - register page', error),
  })

  return (
    <>
      <PageHeading>Register</PageHeading>
      {/* {authRegisterQuery.isError && (
        <div className="my-4 p-4 rounded-md bg-error-100">
          <pre>
            {authRegisterQuery.error instanceof FormError
              ? 'FormError.getData() output: \n' + JSON.stringify(authRegisterQuery.error?.getData(), null, 2)
              : 'generic error message: ' + authRegisterQuery.error.message}
          </pre>
        </div>
      )} */}
      <RegisterForm
        onSaveAsync={async (formValues): Promise<void> => {
          await authRegisterAsync(formValues)
        }}
      />
    </>
  )
}

export default RegisterPage
