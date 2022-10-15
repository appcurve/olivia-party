import clsx from 'clsx'
import Link, { type LinkProps } from 'next/link'

import type { Themable } from '../../../../types/style.types'

export interface HeaderIconLinkProps extends Themable, LinkProps {
  a11y: {
    label: string
  }
  SvgIcon: React.FC<React.ComponentProps<'svg'>>
}

export const HeaderIconLink: React.FC<HeaderIconLinkProps> = ({ a11y, scheme, SvgIcon, ...linkProps }) => {
  return (
    <Link {...linkProps}>
      <a
        className={clsx('inline-flex items-center p-2 rounded-md fx-focus-highlight transition', {
          'hover:bg-white/10 focus:bg-white/10 text-P-link-light hover:text-P-link-light-hover': scheme === 'light',
          'hover:bg-white/75 text-P-primary hover:text-P-primary-hover': scheme === 'dark',
        })}
      >
        <span className="sr-only">{a11y.label}</span>
        <SvgIcon className="h-6 w-6" aria-hidden="true" />
      </a>
    </Link>
  )
}
