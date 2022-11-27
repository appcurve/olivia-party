import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

import { ActionButton } from '../../elements/inputs/ActionButton'

const LABELS = {
  ERROR_BOUNDARY_MESSAGE: 'Application Error',
  ERROR_BOUNDARY_DESCRIPTION: 'Our apologies — this web app has encountered an unexpected error.',
  ERROR_BOUNDARY_TRY_AGAIN_ACTION: 'Try Again',
}

/**
 * React Error Boundary implementation that renders a full-screen error with a "try again" reset button for attempting
 * recovery from uncaught errors related to react-query.
 *
 * Implemented using react-error-boundary; must be a child of react-query's QueryClientProvider/QueryClient.
 *
 * @see {@link https://reactjs.org/docs/error-boundaries.html}
 */
export const ApplicationErrorBoundary: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { reset } = useQueryErrorResetBoundary()

  return (
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
      {children}
    </ErrorBoundary>
  )
}
