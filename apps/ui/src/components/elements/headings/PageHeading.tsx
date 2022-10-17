import clsx from 'clsx'
import { BouncyLoader } from '@firx/react-feedback'

export interface PageHeadingProps {
  subHeading?: string
  /** extra margins are suited good for cases where forms follow a heading; default is 'standard'. */
  bottomMargin?: 'none' | 'small' | 'standard' | 'extra'
  showLoadingSpinner?: boolean
  appendClassName?: string
}

/**
 * Responsive page heading that renders an h1 with text size and margins set.
 */
export const PageHeading: React.FC<React.PropsWithChildren<PageHeadingProps>> = ({
  subHeading,
  bottomMargin,
  showLoadingSpinner,
  appendClassName,
  children,
}) => {
  return (
    <div
      className={clsx('flex justify-between items-center', {
        'mb-2 sm:mb-4': bottomMargin === 'small',
        'mb-4 sm:mb-6 md:mb-8': bottomMargin === 'standard',
        'mb-6 sm:mb-8 md:mb-10': bottomMargin === 'extra',
      })}
    >
      <div className="flex-1">
        <h1 className={clsx('text-2xl sm:text-3xl font-semibold tracking-tight', 'text-P-heading', appendClassName)}>
          {children}
        </h1>
        {typeof subHeading === 'string' && (
          <div className="text-xl sm:text-2xl pl-0.5 tracking-tight text-P-subheading">{subHeading || <>&nbsp;</>}</div>
        )}
      </div>
      {!!showLoadingSpinner && (
        <div className="pl-4">
          <BouncyLoader />
        </div>
      )}
    </div>
  )
}

PageHeading.defaultProps = {
  bottomMargin: 'standard',
}
