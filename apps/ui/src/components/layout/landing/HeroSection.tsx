import clsx from 'clsx'
import Link, { type LinkProps } from 'next/link'

import { VscTriangleRight as VscTriangleRightIcon } from 'react-icons/vsc'

import { useAuthSession } from '../../../context/SessionContextProvider'
import type { Themable } from '../../../types/style.types'

export interface HeroLinkButtonProps extends LinkProps, Themable {
  appendClassName?: string
}
export interface SubLinkProps extends LinkProps, Themable {}
export interface MobileLinkProps extends LinkProps, Themable {}

const HeroLinkButton: React.FC<React.PropsWithChildren<HeroLinkButtonProps>> = ({
  href,
  scheme,
  appendClassName,
  children,
  ...restLinkProps
}) => {
  const commonClassName = clsx(
    'flex w-full items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-md',
    'text-base md:text-lg leading-6 font-medium cursor-pointer',
    'shadow-sm fx-focus-highlight transition duration-150 ease-in-out',
    appendClassName,
  )

  const lightClassName = clsx('bg-white hover:bg-P-neutral-100 text-P-heading')

  const darkClassName = clsx(
    'text-white',
    'bg-P-background-contrast-bright hover:bg-P-background-contrast-bright-hover',
  )

  return (
    <Link href={href} {...restLinkProps}>
      <a className={clsx(commonClassName, scheme === 'light' ? lightClassName : darkClassName)}>{children}</a>
    </Link>
  )
}

const SubLink: React.FC<React.PropsWithChildren<SubLinkProps>> = ({
  scheme = 'dark',
  href,
  children,
  ...restLinkProps
}) => {
  const commonClassName = clsx(
    'flex items-center justify-center rounded-md',
    'text-base xs:text-lg sm:text-xl font-medium',
    'fx-focus-highlight focus:bg-white/30 transition duration-150 ease-in-out',
  )

  const lightClassName = clsx(
    'md:py-4 md:px-10 md:text-lg',
    'border border-transparent',
    'bg-white hover:bg-gray-50 px-8 py-3',
  )

  const darkClassName = clsx(
    'flex items-center justify-center px-2 py-2',
    'border border-transparent bg-transparent',
    'text-P-subheading hover:text-P-subheading/85 hover:underline',
  )
  return (
    <Link href={href} {...restLinkProps}>
      <a className={clsx(commonClassName, scheme === 'light' ? lightClassName : darkClassName)}>{children}</a>
    </Link>
  )
}

export const MobileLink: React.FC<React.PropsWithChildren<MobileLinkProps>> = ({
  scheme = 'dark',
  href,
  children,
  ...restLinkProps
}) => {
  return (
    <Link href={href} {...restLinkProps}>
      <a
        className={clsx('inline-block px-2 py-2 rounded-md font-medium text-sm', {
          'text-P-link-dark-secondary': scheme === 'dark',
          'text-P-link-light': scheme === 'light',
        })}
      >
        {children}
      </a>
    </Link>
  )
}

export const HeroSection: React.FC = () => {
  const session = useAuthSession({ optional: true })

  return (
    <div className="bg-party relative z-0 overflow-hidden shadow-sm">
      <div>
        <div className="relative z-10 pt-9 pb-6 sm:pt-12 sm:pb-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="text-center py-0 sm:py-8 rounded-2xl bg-transparent">
              <h2 className="text-5xl md:text-6xl font-extrabold leading-8 tracking-tight text-P-heading sm:leading-none">
                Olivia<span className="italic">Party</span>
              </h2>
              <p
                className={clsx(
                  'max-w-md md:max-w-2xl lg:max-w-3xl mx-auto mt-4 md:mt-6',
                  'text-P-subheading text-xl sm:text-2xl md:text-3xl',
                )}
              >
                Open Accessibility Solutions
              </p>
              <div className="max-w-lg mx-auto mt-8 mb-4 md:mt-10 md:mb-2">
                {session?.profile ? (
                  <div className="p-8 rounded-md bg-white/50">
                    <div className="w-full mx-auto mb-4 leading-none text-lg text-left text-P-heading">
                      Welcome, {session.profile.name}
                    </div>
                    <HeroLinkButton scheme="dark" href="/app">
                      <div className="flex justify-between items-center">
                        <span>
                          My Olivia<span className="italic">Party</span>
                        </span>
                        <VscTriangleRightIcon className="h-6 w-6 ml-1" />
                      </div>
                    </HeroLinkButton>
                  </div>
                ) : (
                  <div className="flex justify-center items-center flex-col xs:flex-row">
                    <HeroLinkButton
                      scheme="dark"
                      href="/register"
                      appendClassName="max-w-xs xs:max-w-[14rem] mr-0 xs:mr-2 mb-2 xs:mb-0"
                    >
                      Create Account
                    </HeroLinkButton>
                    <HeroLinkButton
                      scheme="dark"
                      href="/sign-in"
                      appendClassName="max-w-xs xs:max-w-[14rem] ml-0 xs:ml-2 mt-2 xs:mt-0"
                    >
                      Sign In
                    </HeroLinkButton>
                  </div>
                )}
              </div>
              <div className="mt-0 md:mt-7 flex flex-wrap justify-center items-center space-x-2">
                <SubLink scheme="dark" href="/about">
                  About
                </SubLink>
                <SubLink scheme="dark" href="/donate">
                  Donate
                </SubLink>
                <SubLink scheme="dark" href="https://github.com/appcurve/olivia-party">
                  GitHub
                </SubLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
