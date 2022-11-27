import type { NextPage } from 'next'
import Router, { useRouter } from 'next/router'

import { ChevronRightIcon } from '@heroicons/react/20/solid'

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
import { getQueryStringValue } from '../lib/uri/query'

const LABELS = {
  YOU_ARE_SIGNED_IN: 'You are signed in:',
  RETURN_TO: 'Return to: ',
}

/**
 * Sign-in page.
 * If a user is already logged in, the page renders a link to the authenticated app path and a sign out button.
 *
 * @see _app.tsx
 * @see PlaceholderLayout
 */
export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext()
  const router = useRouter()

  const { signInAsync } = useAuthSignInQuery()
  const redirectPath = getValidatedPathUri(getQueryStringValue(router.query?.redirect)) ?? AUTHENTICATED_APP_PATH

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
            <SignInForm
              onSignInAsync={async (formValues): Promise<void> => {
                await signInAsync(formValues, {
                  onSuccess: () => Router.push(redirectPath),
                })
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default SignInPage
