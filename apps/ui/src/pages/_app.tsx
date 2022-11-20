import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ErrorBoundary } from 'react-error-boundary'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '../styles/tailwind.css'

import { Spinner } from '@firx/react-feedback'
import { ModalContextProvider, useModalContext, ModalVariant } from '@firx/react-modals'
import { AuthError, ApiError, FormError, ConflictError } from '@firx/react-fetch'

import { AppConfig, ApplicationContextProvider } from '../context/ApplicationContextProvider'
import { ParentContextProvider } from '../context/ParentContextProvider'
import { SessionContextProvider } from '../context/SessionContextProvider'

import { LOCAL_STORAGE_SESSION_CTX_FLAG_KEY } from '../api/constants/auth'
import { authQueryKeys } from '../api/hooks/auth'
import { NavigationLink } from '../types/navigation.types'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthContainer } from '../components/layout/AuthContainer'
import { PublicContainer } from '../components/layout/PublicContainer'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'
import { ActionButton } from '../components/elements/inputs/ActionButton'

export const SIGN_IN_ROUTE = '/sign-in'
export const SIGN_UP_ROUTE = '/register'

export const DEFAULT_AUTHENTICATED_ROUTE = '/app'

export const GLOBAL_ROUTES = ['/guides', '/services', '/donate', '/sponsor', '/shop', '/about']
export const PUBLIC_ROUTES_WHITELIST = ['/', SIGN_IN_ROUTE, SIGN_UP_ROUTE, ...GLOBAL_ROUTES]

// note: Header.tsx adds a "My App" type link for signed in users plus a fixed '/shop' icon link
export const PUBLIC_NAV_LINKS: NavigationLink[] = [
  // ensure all paths are added to the GLOBAL_ROUTES list above or they will direct unauthenticated users to sign-in
  { title: 'Guides', href: '/guides' },
  { title: 'Services', href: '/services' },
  { title: 'Donate', href: '/donate' },
  { title: 'About', href: '/about' },
]

// show both auth-only and public nav links to authenticated users
export const AUTHENTICATED_NAV_LINKS = [{ title: 'App', href: DEFAULT_AUTHENTICATED_ROUTE }, ...PUBLIC_NAV_LINKS]

const LABELS = {
  ERROR_BOUNDARY_MESSAGE: 'Application Error',
  ERROR_BOUNDARY_DESCRIPTION: 'Our apologies — this web app has encountered an unexpected error.',
  ERROR_BOUNDARY_TRY_AGAIN_ACTION: 'Try Again',
}

const isPublicRoute = (routerPath: string): boolean =>
  routerPath === '/'
    ? true
    : PUBLIC_ROUTES_WHITELIST.concat(['/500', '/404']).some((route) =>
        route === '/' ? false : routerPath.startsWith(route),
      )

/**
 * Project parent with top-level context providers including global configuration of react-query.
 */
const ReactApp: React.FC<AppProps> = ({ Component, pageProps, router }) => {
  // @todo add in more meaningful ApplicationContext + useApplicationContext() e.g. path for sign-in etc
  // const app = useApplicationContext()

  // @todo fleshed out error notifications
  const [showAlertModal] = useModalContext({ title: 'Alert', variant: ModalVariant.ERROR }, () => (
    <div>Query Client Error</div>
  ))

  const [queryClient] = useState<QueryClient>(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            suspense: false,
            retry: (failCount, error): boolean => {
              if (error instanceof ApiError && error.status === 404) {
                return false
              }

              console.warn(`queryclient queries error count: ${failCount}`)
              return true
            },
            // retry: true,
            // refetchOnWindowFocus: true,
            // useErrorBoundary: true,
            useErrorBoundary: (error: unknown): boolean => {
              return error instanceof AuthError // e.g. error.response?.status >= 500
            },
          },
          mutations: {
            // useErrorBoundary: false
            useErrorBoundary: (error: unknown): boolean => {
              return error instanceof AuthError // e.g. error.response?.status >= 500
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown, _query): void => {
            // @todo add notifications/toasts for network errors e.g. toast.error(error.message)
            showAlertModal()

            if (error instanceof AuthError) {
              console.error(`Global query client error handler (AuthError Case) [${error.message}]`, error)

              // refer to SessionContextProvider + useAuthSessionQuery() for complete auth behavior
              if (typeof window !== 'undefined') {
                console.warn('setting localstorage to disable session query...')
                window.localStorage.setItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY, 'disabled')
              }

              // if (!isPublicRoute(router.pathname) && router.pathname !== SIGN_IN_ROUTE) {
              //   router.push(
              //     router.asPath
              //       ? `${app.keyRoutes.signIn}?redirect=${encodeURIComponent(router.asPath)}`
              //       : app.keyRoutes.signIn,
              //   )
              // }

              queryClient.removeQueries(authQueryKeys.all) // added - clear cache results (new requests will hard-load)
              queryClient.clear() // dev note: omit may cause uncaught exception fail at line 108 fail of apiFetch
              return
            }

            // // only show toast if there's already data in the cache as this indicates a failed background update
            // if (query.state.data !== undefined) {
            //   // toast.error(`Something went wrong: ${error.message}`)
            // }

            // dev-only debug @todo grep pass for console log/warn/error and remove for production
            console.error('global query error handler:', error instanceof Error ? error.message : String(error))
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown): void => {
            if (
              process.env.NODE_ENV === 'development' &&
              !(error instanceof FormError || error instanceof ConflictError)
            ) {
              console.error('global mutation error handler for non-FormError/non-ConflictError:', error)
            }

            return
          },
        }),
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider>
        {(isSessionReady): JSX.Element => (
          <AppLayout navigationLinks={isSessionReady ? AUTHENTICATED_NAV_LINKS : PUBLIC_NAV_LINKS}>
            {isPublicRoute(router.pathname) ? (
              <PublicContainer variant={router.pathname === '/' ? 'fullWidth' : 'constrained'}>
                <Component {...pageProps} />
              </PublicContainer>
            ) : isSessionReady ? (
              <AuthContainer>
                <ParentContextProvider>
                  {/* autherrorlistener, sessiontimer, etc */}
                  <Component {...pageProps} />
                </ParentContextProvider>
              </AuthContainer>
            ) : (
              <SessionLoadingScreen />
            )}
          </AppLayout>
        )}
      </SessionContextProvider>

      {/* ReactQueryDevtools is only included in bundles when NODE_ENV === 'development' */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

/**
 * Custom NextJS App.
 */
function CustomApp({ Component, pageProps, router }: AppProps): JSX.Element {
  const [appConfig] = useState<AppConfig>({
    keyRoutes: {
      signIn: SIGN_IN_ROUTE,
    },
  })

  const { reset } = useQueryErrorResetBoundary()

  return (
    <ApplicationContextProvider config={appConfig}>
      <ModalContextProvider>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta key="description" name="description" content={process.env.NEXT_PUBLIC_SITE_META_DESCRIPTION} />
          <title>{process.env.NEXT_PUBLIC_SITE_TITLE}</title>
        </Head>
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }): JSX.Element => (
            <div className="grid grid-cols-1 grid-rows-1 min-h-screen min-w-max p-8 justify-center items-center bg-P-neutral-100">
              <div className="flex flex-col border-2 border-P-error-200 justify-center items-center mx-auto p-6 bg-P-error-100 rounded-lg sm:min-w-1/4 max-w-3xl">
                <h1 className="text-2xl mb-2 font-semibold tracking-tight text-P-error-700">
                  {LABELS.ERROR_BOUNDARY_MESSAGE}
                </h1>
                <p className="mb-4 text-P-error-800">{LABELS.ERROR_BOUNDARY_DESCRIPTION}</p>
                <ActionButton scheme="dark" variant="error-outline" onClick={(): void => resetErrorBoundary()}>
                  {LABELS.ERROR_BOUNDARY_TRY_AGAIN_ACTION}
                </ActionButton>
              </div>
            </div>
          )}
        >
          <React.Suspense fallback={<Spinner />}>
            <ReactApp Component={Component} pageProps={pageProps} router={router} />
          </React.Suspense>
        </ErrorBoundary>
      </ModalContextProvider>
    </ApplicationContextProvider>
  )
}

export default CustomApp
