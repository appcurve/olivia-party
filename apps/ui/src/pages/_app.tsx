import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SWRConfig } from 'swr' // useSWR

import { SessionContextProvider } from '../context/SessionContextProvider'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { SessionLoadingScreen } from '../components/layout/SessionLoadingScreen'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'

import '../styles/tailwind.css'

// const fetcher = (resource, init) => fetch(resource, init).then((res) => res.json())

const PUBLIC_ROUTES = ['/', '/sign-in']

const isPublicRoute = (routerPath: string) =>
  PUBLIC_ROUTES.some((route) => routerPath === '/' || routerPath.startsWith(route))

function CustomApp(props: AppProps) {
  const { Component, pageProps, router } = props

  return (
    <>
      <Head>
        <title>UI</title>
      </Head>
      <ErrorBoundary>
        <SWRConfig
          value={{
            refreshInterval: 3000,
            fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
          }}
        >
          <SessionContextProvider>
            {(isSessionReady) =>
              isPublicRoute(router.asPath) ? (
                <PublicLayout>
                  <Component {...pageProps} />
                </PublicLayout>
              ) : isSessionReady ? (
                <ProtectedLayout>
                  {/* autherrorlistener, sessiontimer, etc */}
                  <Component {...pageProps} />
                </ProtectedLayout>
              ) : (
                <SessionLoadingScreen />
              )
            }
          </SessionContextProvider>
        </SWRConfig>
      </ErrorBoundary>
    </>
  )
}

export default CustomApp
