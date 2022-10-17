import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

/**
 * Top-level container for all private routes where authentication is required.
 *
 * Per `_app.tsx` child components can assume a successfully authenticated user exists
 * and can make use of hooks such as `useAuthSession()` to access their profile.
 *
 * @see _app.tsx
 * @see AppLayout
 */
export const AuthContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-full mx-auto sm:p-6 fx-layout-max-width fx-layout-padding-x">
      <div
        className={clsx(
          'w-full mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 sm:rounded-md',
          'sm:border sm:border-fx1-200 sm:shadow-sm sm:bg-white',
        )}
      >
        {children}
      </div>
    </div>
  )
}
