import React, { useCallback, useState } from 'react'
import type { NextPage } from 'next'
import Router, { useRouter } from 'next/router'
import Confetti from 'react-confetti'
import clsx from 'clsx'

import { ChevronRightIcon } from '@heroicons/react/20/solid'

import { SignInDto } from '@firx/op-data-api'
import { AUTHENTICATED_APP_PATH } from './_app'
import { useAuthSignInQuery } from '../api/hooks/auth'
import { ProjectNameInline } from '../components/brand/ProjectNameInline'
import { PageHeading } from '../components/elements/headings/PageHeading'
import { LinkButton } from '../components/elements/inputs/LinkButton'
import { NavLink } from '../components/elements/inputs/NavLink'
import { SignInForm } from '../components/prefabs/SignInForm'
import { SignOutButton } from '../components/prefabs/SignOutButton'
import { useSessionContext } from '../context/SessionContextProvider'
import { getValidatedPathUri } from '../lib/uri/paths'
import { getQueryStringValue, getQueryStringValues } from '../lib/uri/query'
import { useWindowSize } from '@react-hookz/web'
import { Heading } from '../components/elements/headings/Heading'
import { FormContainer } from '@firx/react-forms-rhf'

const LABELS = {
  YOU_ARE_SIGNED_IN: 'You are signed in:',
  RETURN_TO: 'Return to: ',
}

export interface PostRegistrationSignInProps {
  name?: string
  email?: string
  onSignInAsync: (formValues: SignInDto) => Promise<void>
}

// @future - track if welcome sign-in animation already played e.g. in the session to not repeat
export const PostRegistrationSignIn: React.FC<PostRegistrationSignInProps> = ({ name, email, onSignInAsync }) => {
  const [showHighlight, setShowHighlight] = useState<boolean>(true)
  const { width, height } = useWindowSize()

  return (
    <>
      <Confetti
        width={width}
        height={height}
        numberOfPieces={800}
        recycle={false}
        onConfettiComplete={async (): Promise<void> => {
          setShowHighlight(false)
        }}
      />
      <FormContainer appendClassName="mb-8">
        <div
          className={clsx('p-4 xs:p-8 rounded-lg border-2 transition-colors duration-1000', {
            ['bg-yellow-50 border-orange-100']: showHighlight,
            ['bg-transparent border-transparent']: !showHighlight,
          })}
        >
          <Heading type="h2" appendClassName="mx-auto mb-4 text-center">
            Welcome to <ProjectNameInline />
            {name ? ` ${name}` : ''}!
          </Heading>
          <div className="max-w-sm mx-auto">
            <p className="mb-4 text-P-heading text-center">Please sign in with your new password:</p>
            <div className="p-4 xs:p-8 rounded-md border border-P-neutral-200 bg-white/50">
              <SignInForm email={email} onSignInAsync={onSignInAsync} />
            </div>
          </div>
        </div>
      </FormContainer>
    </>
  )
}

/**
 * Sign-in page.
 * If the user is already logged in the page renders a link to the authenticated app path and a sign out button.
 *
 * @see _app.tsx
 * @see PlaceholderLayout
 */
export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext()
  const router = useRouter()

  const { signInAsync } = useAuthSignInQuery()
  const redirectPath = getValidatedPathUri(getQueryStringValue(router.query?.redirect)) ?? AUTHENTICATED_APP_PATH

  const [welcome, name, email] = getQueryStringValues(router.query, 'welcome', 'name', 'email')

  const handleSignInAsync = useCallback(
    async (formValues: SignInDto): Promise<void> => {
      await signInAsync(formValues, {
        onSuccess: () => {
          Router.push(redirectPath)
        },
      })
    },
    [redirectPath, signInAsync],
  )

  if (welcome) {
    return <PostRegistrationSignIn name={name} email={email} onSignInAsync={handleSignInAsync} />
  }

  return (
    <>
      <PageHeading>{session?.profile ? <span>Signed In</span> : <span>Sign In</span>}</PageHeading>
      {session?.profile ? (
        <>
          <p>Welcome back {session.profile.name}!</p>
          <div className="flex flex-col mt-4 space-y-4 items-start">
            {!!redirectPath && (
              <div className="block">
                {LABELS.RETURN_TO} <NavLink href={redirectPath}>{redirectPath}</NavLink>
              </div>
            )}
            <LinkButton scheme="light" href="/app">
              <ProjectNameInline />
              &nbsp;Dashboard
              <ChevronRightIcon className="ml-1 h-5 w-5" />
            </LinkButton>
            <SignOutButton />
          </div>
        </>
      ) : (
        <div className="flex justify-center w-full mb-4 sm:mb-6 md:mb-8">
          <div className="p-4 xs:p-8 rounded-md border border-P-neutral-300 bg-P-neutral-50">
            <SignInForm onSignInAsync={handleSignInAsync} />
          </div>
        </div>
      )}
    </>
  )
}

export default SignInPage
