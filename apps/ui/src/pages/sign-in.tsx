import { ChevronRightIcon } from '@heroicons/react/20/solid'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
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
 *
 * @see _app.tsx
 * @see PlaceholderLayout
 */
export const SignInPage: NextPage = (_props) => {
  const session = useSessionContext()
  const router = useRouter()

  const redirectPath = getValidatedPathUri(getQueryStringValue(router.query?.redirect)) ?? ''

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
            <SignInForm />
          </div>
        </div>
      )}
    </>
  )
}

export default SignInPage
