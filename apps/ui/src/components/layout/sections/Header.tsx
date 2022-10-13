import React, { Fragment, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { Popover, Transition } from '@headlessui/react'

import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid' // sign-out icon

import { useIsMounted } from '@firx/react-hooks'
import type { NavigationLink } from '../../../types/navigation.types'
import { useApplicationContext } from '../../../context/ApplicationContextProvider'
import { useSessionContext } from '../../../context/SessionContextProvider'
import { useAuthSignOut } from '../../../api/hooks/auth'
import { UserProfileMenu } from '../menus/UserProfileMenu'
import { LinkButton } from '../../elements/inputs/LinkButton'
import { IconButton } from '../../elements/inputs/IconButton'
import { LogoLink } from './header-parts/LogoLink'
import { GitHubLink } from './header-parts/GitHubLink'
import { Themable } from '../../../types/style.types'

export interface HeaderProps {
  navigationLinks: NavigationLink[]
}

export interface DesktopNavMenuProps extends Pick<HeaderProps, 'navigationLinks'>, Themable {}

export interface MenuLinksProps {
  navigationLinks: HeaderProps['navigationLinks']
  // considering...
  // (NavigationLink & { SvgIcon?: React.FC<React.ComponentPropsWithoutRef<'svg'>> })[]

  classNames: {
    /** Link (anchor) classNames common to all menu links regardless of router state. */
    base?: string
    /** Conditional classNames for menu links that do not correspond to the router's current page. */
    standard?: string
    /** Conditional classNames for menu links that correspond to the router's current page. */
    current?: string
  }
  onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

const LABELS = {
  HOME: 'Home',
  SIGN_IN: 'Sign In',
  SIGN_OUT: 'Sign Out',
  A11Y_MAIN: 'Main',
  A11Y_CLOSE_MENU: 'Close Menu',
  A11Y_OPEN_NAVIGATION_MENU: 'Open Navigation Menu',
}

const MobileNavCloseButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
  function MobileNavMenuButton(props, forwardedRef) {
    return <IconButton ref={forwardedRef} SvgIcon={XMarkIcon} a11y={{ label: LABELS.A11Y_CLOSE_MENU }} {...props} />
  },
)

const MobileNavMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
  function MobileNavMenuButton(props, forwardedRef) {
    return (
      <IconButton
        ref={forwardedRef}
        SvgIcon={Bars3Icon}
        a11y={{ label: LABELS.A11Y_OPEN_NAVIGATION_MENU }}
        {...props}
      />
    )
  },
)

/**
 * Menu navigation links rendered as a series of siblings implemented using NextJS `Link`.
 *
 * Individual links (anchor tags) have the given `linkClassName` applied as className and the
 * optional `onLinkClick` set as `onClick` handler.
 */
const MenuLinks: React.FC<MenuLinksProps> = ({ navigationLinks, classNames, onLinkClick }) => {
  const router = useRouter()

  const { base, standard, current } = classNames

  const isCurrentMenuLink = (routerPathName: string, itemHref: string): boolean => {
    return routerPathName !== '/' && itemHref === routerPathName
  }

  return (
    <>
      {navigationLinks.map((item) => {
        const isCurrent = isCurrentMenuLink(router.pathname, item.href)

        return (
          <Link key={item.title} href={`${item.href}`}>
            <a
              // the fx-nav-link-* prefix classNames are to prevent key collisions
              className={clsx(base, {
                [clsx('fx-nav-link-standard', standard)]: !isCurrent,
                [clsx('fx-nav-link-current', current)]: isCurrent,
              })}
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
const DesktopNavMenu: React.FC<DesktopNavMenuProps> = ({ scheme, navigationLinks }) => {
  const app = useApplicationContext()
  const session = useSessionContext()

  const baseLinkClassName = clsx(
    'inline-block px-3 py-2 rounded-md',
    'text-base font-medium text-center leading-tight',
    'transition focus:outline-none focus:ring-2',
    'hover:bg-white/10 focus:bg-white/10',
    {
      'focus:text-action-primary-hover hover:text-action-primary-hover focus:ring-fx1-200': scheme === 'dark',
      'focus:text-P-link-light-hover hover:text-P-link-light-hover focus:ring-P-a11y-highlight': scheme === 'light',
    },
  )

  const standardLinkClassName = clsx({
    'text-action-primary hover:bg-white/25 focus:bg-white/20': scheme === 'dark',
    'text-P-link-light hover:bg-white/8': scheme === 'light',
  })

  const currentLinkClassName = clsx({
    'text-action-primary bg-white/50 hover:bg-white/40 focus:bg-white/40': scheme === 'dark',
    'text-P-link-light bg-white/10 hover:bg-white/10 focus:bg-white/10': scheme === 'light',
  })

  return (
    <div className="hidden lg:flex lg:justify-start lg:items-center lg:flex-1 text-slate-900">
      <div className="flex justify-between items-center flex-1">
        <div className="flex-1 px-2 space-x-2">
          <MenuLinks
            navigationLinks={navigationLinks}
            classNames={{
              base: baseLinkClassName,
              standard: standardLinkClassName,
              current: currentLinkClassName,
            }}
          />
        </div>
        {session?.profile ? (
          <UserProfileMenu name={session.profile.name} />
        ) : (
          <div className="flex space-x-4">
            <GitHubLink scheme="light" />
            <LinkButton scheme="light" height="short" href={app.keyRoutes.signIn}>
              {LABELS.SIGN_IN}
            </LinkButton>
          </div>
        )}
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
  Pick<HeaderProps, 'navigationLinks'> & {
    isMenuOpen: boolean
    onCloseMenuClick: () => void
    onMenuItemClick: () => void
  }
> = ({ navigationLinks, isMenuOpen, onCloseMenuClick, onMenuItemClick }) => {
  const { push: routerPush } = useRouter()

  const app = useApplicationContext()
  const session = useSessionContext()

  const isMounted = useIsMounted()
  const { signOut, isSuccess: isSignOutSuccess } = useAuthSignOut()

  useEffect(() => {
    if (isSignOutSuccess && isMounted()) {
      routerPush(process.env.NEXT_PUBLIC_DEFAULT_SIGN_OUT_REDIRECT_PATH ?? '/')
    }
  }, [isSignOutSuccess, isMounted, routerPush])

  // @todo listen for router events for navigation change -- more idiomatic and explicit vs. click events
  const handleMenuLinkClick = (): void => {
    if (isMenuOpen) {
      onMenuItemClick()
    }
  }

  const baseLinkClassName = clsx(
    'w-full px-5 py-2 text-lg text-action-primary font-medium fx-focus-ring-form ring-inset rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-fx1-200',
  )

  const standardLinkClassName = 'focus:bg-white/30'
  const currentLinkClassName = 'bg-white/30 focus:bg-white/40'

  return (
    <div className="rounded-b-md shadow-lg bg-fx1-100 ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="pt-4 flex items-center justify-between">
        <div className="pl-4">
          <LogoLink scheme="dark" />
        </div>
        <div className="pr-4">
          <MobileNavCloseButton onClick={onCloseMenuClick} />
        </div>
      </div>
      <div className="pt-2">
        <div className="p-2 space-y-1">
          <MenuLinks
            navigationLinks={navigationLinks}
            classNames={{
              base: clsx('block', baseLinkClassName),
              standard: standardLinkClassName,
              current: currentLinkClassName,
            }}
            onLinkClick={handleMenuLinkClick}
          />
        </div>
        <div className="py-2 px-2 border-t border-fx1-200 -mt-px">
          {session?.profile ? (
            <button
              type="button"
              className={clsx('flex items-center justify-start text-action-primary', baseLinkClassName)}
              role="menuitem"
              onClick={(): void => {
                signOut() // fire + forget the async function
              }}
            >
              <ArrowLeftOnRectangleIcon className="inline-block h-5 w-5 mr-2" aria-hidden />
              <span>{LABELS.SIGN_OUT}</span>
            </button>
          ) : (
            <div className="flex w-full">
              <Link href={app.keyRoutes.signIn}>
                <a className={clsx('block', baseLinkClassName, standardLinkClassName)} role="menuitem">
                  <ArrowRightOnRectangleIcon className="inline-block h-5 w-5 mr-2" aria-hidden="true" />
                  <span>{LABELS.SIGN_IN}</span>
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const headerClassName = 'relative border-b bg-P-background-contrast-bright border-P-background-contrast-hover'

const navClassName = clsx(
  'relative mx-auto flex items-center justify-between py-2',
  'fx-layout-max-width fx-layout-padding-x',
)

/**
 * Header with logo that includes a responsive navigation menu.
 */
export const Header: React.FC<HeaderProps> = ({ navigationLinks }) => {
  return (
    <Popover as="header" className={headerClassName}>
      {({ open, close }): JSX.Element => (
        <>
          <nav className={navClassName} aria-label={LABELS.A11Y_MAIN}>
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center space-x-4">
                  <LogoLink scheme="light" />
                </div>
                <div className="flex items-center lg:hidden">
                  <Popover.Button as={MobileNavMenuButton} />
                </div>
              </div>
              <DesktopNavMenu scheme="light" navigationLinks={navigationLinks} />
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
              <MobileNavMenu
                navigationLinks={navigationLinks}
                isMenuOpen={open}
                onCloseMenuClick={close}
                onMenuItemClick={close}
              />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
