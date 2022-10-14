import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface PublicLayoutProps {
  variant?: 'constrained' | 'fullWidth'
}

const outerVariantClassName: Record<Required<PublicLayoutProps>['variant'], string> = {
  constrained: clsx('p-0 xs:py-4 sm:py-8'),
  fullWidth: '', // clsx(),
}

const innerVariantClassName: Record<Required<PublicLayoutProps>['variant'], string> = {
  constrained: clsx(
    'mx-auto max-w-5xl px-4 py-6 xs:py-4 sm:p-8 w-full rounded-md',
    'border-0 xs:border xs:border-fx1-200 xs:shadow-sm bg-white',
  ),
  fullWidth: '', // clsx(),
}

export const PublicLayout: React.FC<PropsWithChildren<PublicLayoutProps>> = ({ variant, children }) => {
  return (
    <div
      className={clsx({
        [outerVariantClassName['constrained']]: variant === 'constrained',
        [outerVariantClassName['fullWidth']]: variant === 'fullWidth',
      })}
    >
      <div
        className={clsx({
          [innerVariantClassName['constrained']]: variant === 'constrained',
          [innerVariantClassName['fullWidth']]: variant === 'fullWidth',
        })}
      >
        {children}
      </div>
    </div>
  )
}

PublicLayout.defaultProps = {
  variant: 'constrained',
}
