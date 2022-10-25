import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import '../styles/tailwind.css'

import { Spinner } from '@firx/react-feedback'
import { SpeechContextProvider } from '@firx/react-player-hooks'
import { ControllerEventStateManager } from '../components/layout/ControllerEventStateManager'

const LABELS = {
  ERROR_BOUNDARY_MESSAGE: 'There was an error',
  ERROR_BOUNDARY_TRY_AGAIN_ACTION: 'Try again',
}

/**
 * Project parent with top-level context providers including global configuration of react-query.
 *
 * Note: `ReactQueryDevtools` is safe to leave in the component tree: it is only included in bundles
 * when NODE_ENV === 'development'.
 */
const ReactApp: React.FC<AppProps> = ({ Component, pageProps, router: _router }) => {
  const [queryClient] = useState<QueryClient>(() => new QueryClient({}))

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SpeechContextProvider>
          <Component {...pageProps} />
        </SpeechContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <ControllerEventStateManager />
    </>
  )
}

function CustomApp({ Component, pageProps, router }: AppProps): JSX.Element {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <>
      <Head>
        <title>OliviaParty Player</title>
      </Head>
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }): JSX.Element => (
          <div>
            <span>{LABELS.ERROR_BOUNDARY_MESSAGE}</span>
            <button
              type="button"
              className="bg-P-neutral-100 px-3 py-2 rounded-md"
              onClick={(): void => resetErrorBoundary()}
            >
              {LABELS.ERROR_BOUNDARY_TRY_AGAIN_ACTION}
            </button>
          </div>
        )}
      >
        {/* <React.Suspense fallback={<Spinner />}> */}
        {/* <ReactApp Component={Component} pageProps={pageProps} router={router} /> */}
        {/* </React.Suspense> */}
        <React.Suspense fallback={<Spinner />}>
          <ControllerEventStateManager />
          <SpeechContextProvider>
            <Component {...pageProps} />
          </SpeechContextProvider>
        </React.Suspense>
      </ErrorBoundary>
    </>
  )
}

export default CustomApp
