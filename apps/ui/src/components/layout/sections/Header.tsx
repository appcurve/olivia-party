import React, { Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { Popover, Transition } from '@headlessui/react'

import { MenuIcon, XIcon, CloudIcon } from '@heroicons/react/outline'

import type { NavigationLink } from '../../../types/navigation.types'
import { useAuthSession } from '../../../context/SessionContextProvider'
import { SessionMenu } from '../menus/SessionMenu'

export interface HeaderProps {
  contentConstraintStyle: string
  containerXPaddingStyle: string
  navigationLinks: NavigationLink[]
}

/**
 * Header logo that links to the route provided via its `href` prop (defaults to '/').
 */
const LogoLink: React.FC<{ href?: string; appendClassName?: string }> = ({ href, appendClassName }) => {
  return (
    <Link href={href}>
      <a className={clsx('inline-block w-fit relative', appendClassName)}>
        <span className="sr-only">{process.env.NEXT_PUBLIC_PROJECT_ORG} Home</span>
        <CloudIcon className="h-8 sm:h-10 w-auto text-slate-500" />
      </a>
    </Link>
  )
}

LogoLink.defaultProps = {
  href: '/',
}

/**
 * Menu navigation links rendered as a series of siblings implemented using NextJS `Link`.
 *
 * Individual links (anchor tags) have the given `linkClassName` applied as className and the
 * optional `onLinkClick` set as `onClick` handler.
 */
const MenuLinks: React.FC<
  Pick<HeaderProps, 'navigationLinks'> & {
    linkClassName: string
    linkCurrentClassName?: string
    onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  }
> = ({ navigationLinks, linkClassName, linkCurrentClassName, onLinkClick }) => {
  const router = useRouter()

  // check is tolerant if there happens to be no trailing slash on router.pathname
  const isCurrentMenuLink = (routerPathName: string, itemHref: string): boolean => {
    return routerPathName !== '/' && itemHref.includes(routerPathName)
  }

  return (
    <>
      {navigationLinks.map((item) => {
        const isCurrent = isCurrentMenuLink(router.pathname, item.href)

        return (
          <Link key={item.title} href={`${item.href}`}>
            <a
              className={clsx(linkClassName, isCurrent ? linkCurrentClassName ?? '' : undefined)}
              aria-current={isCurrent ? 'page' : false}
              onClick={onLinkClick}
            >
              {item.title}
            </a>
          </Link>
        )
      })}
    </>
  )
}

/**
 * Desktop navigation menu containing horizontal links, hidden via CSS for viewports < tailwindcss 'lg' breakpoint.
 */
const DesktopNavMenu: React.FC<Pick<HeaderProps, 'navigationLinks'>> = ({ navigationLinks }) => {
  const session = useAuthSession(true)

  return (
    <div className="hidden lg:flex lg:justify-start lg:items-center lg:flex-1 text-slate-900">
      <div className="flex justify-between items-center flex-1">
        <div className="flex-1 px-6 space-x-4">
          <MenuLinks
            navigationLinks={navigationLinks}
            linkClassName={clsx(
              'inline-block px-4 py-2 border-2 rounded-lg',
              'transition-bg duration-200',
              'text-base text-center leading-tight font-medium hover:text-slate-800',
              'border-transparent hover:bg-slate-100 hover:border-slate-200',
            )}
            linkCurrentClassName={'text-slate-900'}
          />
        </div>
        {session && <SessionMenu name={session.session.name} />}
      </div>
    </div>
  )
}

/**
 * Mobile navigation menu body, intended for rendering as a child of HeadlessUI's `Popover.Panel`.
 *
 * @todo add aria-current for current page + current page styling
 * e.g. https://tailwindui.com/components/application-ui/navigation/navbars "With Search in Column Layout"
 */
const MobileNavMenu: React.FC<
  Pick<HeaderProps, 'navigationLinks'> & { isMenuOpen: boolean; onMenuItemClick: () => void }
> = ({ navigationLinks, isMenuOpen, onMenuItemClick }) => {
  // @todo listen for router events for navigation change -- more idiomatic and explicit vs. click events
  const handleMenuLinkClick = () => {
    if (isMenuOpen) {
      onMenuItemClick()
    }
  }

  return (
    <div className="rounded-b-lg shadow-lg bg-slate-200 ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="px-5 pt-4 flex items-center justify-between">
        <LogoLink />
        <div className="-mr-2">
          <Popover.Button
            className={clsx(
              'bg-white border-slate-300 rounded-md border-2 p-2',
              'inline-flex items-center justify-center',
              'hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-100',
            )}
          >
            <span className="sr-only">Close Menu</span>
            <XIcon className="h-5 w-5 text-slate-800" aria-hidden="true" />
          </Popover.Button>
        </div>
      </div>
      <div className="py-6">
        <div className="space-y-1 text-slate-600">
          <MenuLinks
            navigationLinks={navigationLinks}
            linkClassName={clsx('block w-full px-5 py-2 ui-focus ui-focus-inset text-lg font-medium')}
            linkCurrentClassName={'bg-slate-100 text-slate-500'}
            onLinkClick={handleMenuLinkClick}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Header with branding that implements a responsive navigation menu.
 */
export const Header: React.FC<HeaderProps> = ({ contentConstraintStyle, containerXPaddingStyle, navigationLinks }) => {
  return (
    <Popover as="header" className={clsx('relative border-b-2 bg-slate-100 border-slate-200')}>
      {({ open, close }) => (
        <>
          <nav
            className={clsx(
              'relative mx-auto flex items-center justify-between py-3',
              contentConstraintStyle,
              containerXPaddingStyle,
            )}
            aria-label="Main"
          >
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center space-x-4">
                  <LogoLink />
                </div>
                <div className="flex items-center lg:hidden">
                  <Popover.Button
                    className={clsx(
                      'inline-flex items-center justify-center p-2 rounded-md',
                      'text-slate-400 bg-white border-2 border-slate-200 hover:bg-slate-100',
                      'focus:outline-none focus:ring-1 focus-ring-inset focus:ring-slate-100',
                    )}
                  >
                    <span className="sr-only">Open Navigation Menu</span>
                    <MenuIcon className="h-5 w-5 text-slate-600" />
                  </Popover.Button>
                </div>
              </div>
              <DesktopNavMenu navigationLinks={navigationLinks} />
            </div>
          </nav>
          {/* popover containing mobile nav menu: */}
          <Transition
            show={open}
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel
              focus
              static
              className={clsx('absolute z-30 top-0 inset-x-0 transition origin-top-right lg:hidden')}
            >
              <MobileNavMenu navigationLinks={navigationLinks} isMenuOpen={open} onMenuItemClick={close} />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
