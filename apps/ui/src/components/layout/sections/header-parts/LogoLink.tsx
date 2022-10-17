import Link from 'next/link'
import clsx from 'clsx'

import { BsJoystick as BsJoystickIcon } from 'react-icons/bs'
import type { Themable } from '../../../../types/style.types'

export interface LogoLinkProps extends Themable {
  href?: string
  appendClassName?: string
}

const LABELS = {
  HOME: 'Home',
}

const getIconClassName = (scheme: Themable['scheme']): string =>
  clsx('h-6 sm:h-8 w-auto transition-colors', {
    'text-P-neutral-200 group-hover:text-P-neutral-300': scheme === 'light',
    'text-P-primary group-hover:text-P-primary-hover': scheme === 'dark',
  })

/**
 * Header logo that links to the route provided via its `href` prop (defaults to '/').
 */
export const LogoLink: React.FC<LogoLinkProps> = ({ scheme = 'light', href, appendClassName }) => {
  return (
    <Link href={href ?? '/'}>
      <a
        className={clsx(
          'group inline-block w-fit p-2 relative rounded-md focus:ring-P-a11y-highlight',
          'focus:outline-none focus:ring-2 transition-colors',
          {
            ['hover:bg-white/10 focus:bg-white/10']: scheme === 'light',
            ['hover:bg-white focus:bg-white']: scheme === 'dark',
          },
          appendClassName,
        )}
        aria-label={`${process.env.NEXT_PUBLIC_SITE_TITLE} &emdash; ${LABELS.HOME}`}
      >
        <BsJoystickIcon className={getIconClassName(scheme)} />
      </a>
    </Link>
  )
}

LogoLink.defaultProps = {
  href: '/',
}
