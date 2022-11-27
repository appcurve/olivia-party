import React, { useState } from 'react'
import type { NextPage } from 'next'
import Confetti from 'react-confetti'
import { useWindowSize } from '@react-hookz/web'

import { useAuthRegisterQuery, useAuthSignInQuery } from '../api/hooks/auth'
import { PageHeading } from '../components/elements/headings/PageHeading'
import { RegisterForm } from '../components/prefabs/RegisterForm'
import { SignInForm } from '../components/prefabs/SignInForm'
import { ProjectNameInline } from '../components/brand/ProjectNameInline'
import { Heading } from '../components/elements/headings/Heading'
import { FormContainer } from '@firx/react-forms-rhf'
import Router from 'next/router'
import { AUTHENTICATED_APP_PATH } from './_app'

export const RegisterPage: NextPage = (_props) => {
  const [success, setSuccess] = useState<{ name: string; email: string } | undefined>(undefined)

  const { mutateAsync: authRegisterAsync } = useAuthRegisterQuery()
  const { signInAsync } = useAuthSignInQuery()

  const { width, height } = useWindowSize()

  return (
    <>
      <PageHeading>Register</PageHeading>
      {!success ? (
        <>
          <Confetti width={width} height={height} />
          <FormContainer appendClassName="mb-8">
            <div className="p-4 xs:p-8 bg-yellow-50 border-2 border-orange-100 rounded-lg">
              <Heading type="h2" appendClassName="mx-auto mb-4 text-center">
                Welcome to <ProjectNameInline />!
              </Heading>
              <div className="max-w-sm mx-auto">
                <p className="mb-4 text-P-heading text-center">Please sign in with your new password:</p>
                <div className="p-4 xs:p-8 rounded-md border border-P-neutral-200 bg-white/50">
                  <SignInForm
                    onSignInAsync={async (formValues): Promise<void> => {
                      await signInAsync(formValues, {
                        onSuccess: () => Router.push(AUTHENTICATED_APP_PATH),
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </FormContainer>
        </>
      ) : (
        <>
          <Heading type="h3" center>
            Create Account
          </Heading>
          <RegisterForm
            onSaveAsync={async (formValues): Promise<void> => {
              await authRegisterAsync(formValues, {
                onSuccess: () => setSuccess({ name: formValues.name, email: formValues.email }),
              })
            }}
          />
          <div className="sm:w-4/6 mx-auto my-8 rounded-md p-4 bg-P-neutral-50">
            <p className="text-sm text-center mx-auto max-w-sm text-P-heading">
              We do not share names, email addresses, or other personally identifying information with third-parties.
            </p>
          </div>
        </>
      )}
    </>
  )
}

export default RegisterPage
