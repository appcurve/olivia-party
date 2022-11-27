import React, { type PropsWithChildren } from 'react'
import Link, { type LinkProps } from 'next/link'
import clsx from 'clsx'

export interface NavLinkProps extends LinkProps {
  focusStyle?: 'default' | 'default-darker' | 'highlight'
  appendClassName?: string
  anchorProps?: Exclude<React.HTMLAttributes<HTMLAnchorElement>, 'className'>
  openInNewTab?: boolean
}

/**
 * Wrapper for the NextJS Link component.
 *
 * The `appendClassName` prop is passed to the underlying anchor (`a`) tag.
 * Additional props specifically for the anchor tag may be supplied via the `anchorProps` prop.
 */
const NavLinkComponent: React.FC<PropsWithChildren<NavLinkProps>> = ({
  appendClassName,
  focusStyle = 'default',
  children,
  openInNewTab,
  anchorProps,
  ...restLinkProps
}) => {
  return (
    <Link {...restLinkProps}>
      <a
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={clsx(
          'inline-block cursor-pointer hover:underline',
          'focus:ring-offset-1 focus:rounded-sm transition-colors duration-150',
          {
            ['fx-focus-highlight']: focusStyle === 'highlight',
            ['fx-focus-ring']: focusStyle === 'default',
            ['fx-focus-ring fx-focus-darker']: focusStyle === 'default-darker',
          },
          appendClassName,
        )}
        {...anchorProps}
      >
        {children}
      </a>
    </Link>
  )
}

export const NavLink = React.memo(NavLinkComponent)
