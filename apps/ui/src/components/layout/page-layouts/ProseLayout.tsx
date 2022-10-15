import clsx from 'clsx'
import { AbsDotsMediaQueryDecor } from './page-layout-parts/AbsDotsMediaQueryDecor'

export interface ProseLayoutProps {
  /**
   * Design variant:
   * - "blank": empty prose page (default)
   * - "dots": conditional 'dots' design to fill sidebar whitespace on larger viewports (breakpoint lg and up)
   */
  variant?: 'blank' | 'dots'
  heading?: string | React.FC | JSX.Element
  subheading?: string | React.FC | JSX.Element
  excerpt?: string | React.FC | JSX.Element
}

export interface LayoutHeaderProps extends Pick<ProseLayoutProps, 'heading' | 'subheading' | 'excerpt'> {}

const LayoutHeader: React.FC<LayoutHeaderProps> = ({ heading, subheading, excerpt }) => {
  if (!(heading || subheading || excerpt)) {
    return null
  }

  return (
    <div className="mx-auto max-w-prose text-lg">
      {(!!heading || !!subheading) && (
        <h1>
          {!!subheading && (
            <span
              className={clsx('block text-center text-lg font-semibold text-P-subheading', { ['mb-2']: !!heading })}
            >
              {typeof subheading === 'string' ? subheading : <>{subheading}</>}
            </span>
          )}
          {!!heading && (
            <span className="block text-center text-3xl font-bold leading-8 tracking-tight text-P-heading sm:text-4xl">
              {typeof heading === 'string' ? heading : <>{heading}</>}
            </span>
          )}
        </h1>
      )}
      {!!excerpt && (
        <div className="mx-auto max-w-prose text-lg">
          <p className="mt-8 text-xl leading-8">{typeof excerpt === 'string' ? excerpt : <>{excerpt}</>}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Page layout for full-page prose that leverages the 'prose' plugin of tailwindcss.
 *
 * Child content is rendered inside a div with tailwindcss 'prose' className and should constrain itself to
 * using typical text/prose components: paragraphs, lists, figures, etc.
 *
 * The optional props `heading`, `subheading`, and `excerpt` support both string and React function component
 * (render props) values. Any React elements should be inline as each is rendered inside a parent block-level element
 * (either a heading or paragraph).
 */
export const ProseLayout: React.FC<React.PropsWithChildren<ProseLayoutProps>> = ({
  variant,
  heading,
  subheading,
  excerpt,
  children,
}) => {
  const showHeader = !!heading || !!subheading || !!excerpt

  return (
    <div className="relative overflow-hidden bg-white py-8 xs:py-10">
      {variant === 'dots' && <AbsDotsMediaQueryDecor />}
      <div className="relative">
        {showHeader && <LayoutHeader heading={heading} subheading={subheading} excerpt={excerpt} />}
        <div
          className={clsx('prose prose-lg mx-auto', {
            ['mt-4 xs:mt-6']: !showHeader,
            ['mt-10 xs:mt-12 sm:mt-14']: showHeader,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

ProseLayout.defaultProps = {
  variant: 'dots',
}
