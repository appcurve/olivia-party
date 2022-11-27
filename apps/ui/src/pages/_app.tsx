import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '../styles/tailwind.css'

import { Spinner } from '@firx/react-feedback'
import { ModalContextProvider, useModalContext, ModalVariant } from '@firx/react-modals'
import { AuthError, ApiError, FormError, ConflictError, NetworkError, NetworkErrorListener } from '@firx/react-fetch'
import { NotificationToaster, toastNotification } from '@firx/react-notifications'

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
import { AuthErrorListener } from '../components/layout/error-handling/AuthErrorListener'
import { ApplicationErrorBoundary } from '../components/layout/error-handling/ApplicationErrorBoundary'

export const SIGN_IN_PATH = '/sign-in'
export const SIGN_UP_PATH = '/register'

export const AUTHENTICATED_APP_PATH = '/app'

export const GLOBAL_ROUTES = ['/guides', '/services', '/donate', '/sponsor', '/shop', '/about']
export const PUBLIC_ROUTES_WHITELIST = ['/', SIGN_IN_PATH, SIGN_UP_PATH, ...GLOBAL_ROUTES]

// note: Header.tsx adds a "My App" type link for signed in users plus a fixed '/shop' icon link
export const PUBLIC_NAV_LINKS: NavigationLink[] = [
  // ensure all paths are added to the GLOBAL_ROUTES list above or they will direct unauthenticated users to sign-in
  { title: 'Guides', href: '/guides' },
  { title: 'Services', href: '/services' },
  { title: 'Donate', href: '/donate' },
  { title: 'About', href: '/about' },
]

// show both auth-only and public nav links to authenticated users
export const AUTHENTICATED_NAV_LINKS = [{ title: 'App', href: AUTHENTICATED_APP_PATH }, ...PUBLIC_NAV_LINKS]

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
  const [alertModalErrorMessage, setAlertModalErrorMessage] = useState<string | undefined>(undefined)

  // @todo fleshed out error notifications
  const [showAlertModal] = useModalContext(
    {
      variant: ModalVariant.ERROR,
      action: () => setAlertModalErrorMessage(undefined),
    },
    () => <div className="text-center">{alertModalErrorMessage || 'Encountered error querying data from API'}</div>,
    [alertModalErrorMessage],
  )

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
          // @see ErrorListener for handling of authentication error events
          onError: (error: unknown, _query): void => {
            console.log('caught an error querycache global')
            if (process.env.NODE_ENV !== 'production') {
              console.error(
                `Global queryCache onError (${error instanceof Error ? error.name : 'UNKNOWN'}): ${
                  error instanceof Error ? error.message : String(error)
                }`,
                error,
              )
            }

            if (error instanceof AuthError) {
              toastNotification.error('You have been signed out because your session has expired.')

              if (process.env.NODE_ENV !== 'production') {
                console.error(`Global queryClient onError (AuthError): ${error.message}`, error)
              }

              // refer to SessionContextProvider + useAuthSessionQuery() for complete auth behavior
              if (typeof window !== 'undefined') {
                console.warn('setting localstorage to disable session query...')
                window.localStorage.setItem(LOCAL_STORAGE_SESSION_CTX_FLAG_KEY, 'disabled')
              }

              // if (!isPublicRoute(router.pathname) && router.pathname !== SIGN_IN_PATH) {
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

            if (error instanceof NetworkError) {
              toastNotification.error('Error fetching data due to network or connectivity issue.')

              if (process.env.NODE_ENV !== 'production') {
                console.error(`Global queryClient onError (NetworkError): ${error.message}`, error)
              }
            }

            // // only show toast if there's already data in the cache as this indicates a failed background update
            // if (query.state.data !== undefined) {
            //   // toast.error(`Something went wrong: ${error.message}`)
            // }

            toastNotification.error('querycache error')

            if (!(error instanceof AuthError) && !(error instanceof NetworkError)) {
              setAlertModalErrorMessage(error instanceof Error ? error.message : String(error))
              showAlertModal()
            }
          },
        }),
        mutationCache: new MutationCache({
          // @todo friendlier mutation errors + add toasts
          onError: (error: unknown): void => {
            if (
              process.env.NODE_ENV === 'development' &&
              !(error instanceof FormError || error instanceof ConflictError)
            ) {
              console.error('global mutation error handler for non-FormError/non-ConflictError:', error)
              return
            }

            setAlertModalErrorMessage(error instanceof Error ? error.message : String(error))
            showAlertModal()
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
                  {/* sessiontimer, etc */}
                  <Component {...pageProps} />
                </ParentContextProvider>
                <AuthErrorListener />
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
 * OliviaParty UI: custom React + NextJS web app for managing OliviaParty players and player content.
 */
function CustomApp({ Component, pageProps, router }: AppProps): JSX.Element {
  const [appConfig] = useState<AppConfig>({
    keyRoutes: {
      signIn: SIGN_IN_PATH,
    },
  })

  return (
    <ApplicationContextProvider config={appConfig}>
      <ModalContextProvider>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta key="description" name="description" content={process.env.NEXT_PUBLIC_SITE_META_DESCRIPTION} />
          <title>{process.env.NEXT_PUBLIC_SITE_TITLE}</title>
        </Head>
        <ApplicationErrorBoundary>
          <NotificationToaster />
          <React.Suspense fallback={<Spinner />}>
            <ReactApp Component={Component} pageProps={pageProps} router={router} />
          </React.Suspense>
          <NetworkErrorListener />
        </ApplicationErrorBoundary>
      </ModalContextProvider>
    </ApplicationContextProvider>
  )
}

export default CustomApp
