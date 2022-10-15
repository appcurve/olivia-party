import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface PublicLayoutProps {
  variant?: 'constrained' | 'fullWidth'
}

const FullWidth: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="h-full">
    <div>{children}</div>
  </div>
)

// @todo refactor for DRY so PublicContainer + AuthContainer are using the same components
const ClampWidth: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="h-full mx-auto sm:p-6 fx-layout-max-width fx-layout-padding-x">
    <div
      className={clsx(
        'w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 sm:rounded-md',
        'sm:border sm:border-fx1-200 sm:shadow-sm sm:bg-white',
      )}
    >
      {children}
    </div>
  </div>
)

/**
 * Top-level container for all public routes where authentication is not required.
 *
 * @see _app.tsx
 * @see AppLayout
 */
export const PublicContainer: React.FC<PropsWithChildren<PublicLayoutProps>> = ({ variant, children }) => {
  console.log('public')
  return <>{variant === 'constrained' ? <ClampWidth>{children}</ClampWidth> : <FullWidth>{children}</FullWidth>}</>
}

PublicContainer.defaultProps = {
  variant: 'constrained',
}
