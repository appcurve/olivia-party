import clsx from 'clsx'
import Link, { type LinkProps } from 'next/link'

import type { Themable } from '../../../types/style.types'

export interface HeroLinkButtonProps extends LinkProps, Themable {}
export interface SubLinkProps extends LinkProps, Themable {}
export interface MobileLinkProps extends LinkProps, Themable {}

const HeroLinkButton: React.FC<React.PropsWithChildren<HeroLinkButtonProps>> = ({
  href,
  scheme,
  children,
  ...restLinkProps
}) => {
  const commonClassName = clsx(
    'flex w-full max-w-sm mx-auto items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-md',
    'md:text-lg text-base leading-6 font-medium cursor-pointer',
    'shadow-sm fx-focus-ring-highlight transition duration-150 ease-in-out',
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
  const commonClassName = clsx('fx-focus-ring-highlight focus:bg-white/30 transition duration-150 ease-in-out')

  const lightClassName = clsx(
    'flex items-center justify-center md:py-4 md:px-10 md:text-lg rounded-md',
    'border border-transparent',
    'bg-white hover:bg-gray-50 px-8 py-3 text-base font-medium',
  )

  const darkClassName = clsx(
    'flex items-center justify-center px-2 py-2 rounded-md',
    'text-lg font-medium',
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
          // 'text-P-link-dark': scheme === 'dark',
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
  return (
    <div
      // to-fx1-200 - ORIG
      // className="relative z-0 overflow-hidden bg-radial-to-tr from-fx1-400 via-[#ECF8FE] to-fx1-400 shadow-sm"
      className="relative z-0 overflow-hidden shadow-sm bg-party"
      // haha sweet: `bg-[#ffbb99] bg-fun`
    >
      <div
      // contemplating a centre radial gradient of white to transparent
      // className="bg-no-repeat bg-radial from-white to-transparent" // from-[#387989]
      >
        <div className="relative z-10 pt-9 pb-6 sm:pt-12 sm:pb-10">
          <div
            className={clsx(
              'max-w-screen-xl mx-auto px-4 sm:px-6',
              // background: radial-gradient(#387989, #6dd5ed);
              // background-repeat: no-repeat;
            )}
          >
            <div
              className={clsx(
                // max-w-3xl mx-auto
                // border-white/10
                //'border-P-heading/80 lg:bg-white',

                // lg:bg-radial-to-tr from-fx1-100 via-[#ECF8FE] to-fx1-100 max-w-6xl
                'text-center py-0 sm:py-8 rounded-2xl bg-transparent', //
              )}
            >
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
              <div className="grid justify-center grid-cols-1 xs:grid-cols-2 gap-y-3 xs:gap-x-3 max-w-lg mx-auto mt-8 mb-4 md:mt-8 md:mb-2">
                {/* <div className="hidden sm:block">
                  <HeroLinkButton scheme="dark" href="/about">
                    Create Account
                  </HeroLinkButton>
                </div> */}
                <HeroLinkButton scheme="dark" href="/about">
                  Create Account
                </HeroLinkButton>
                <HeroLinkButton scheme="dark" href="/about">
                  Sign In
                </HeroLinkButton>
                {/* <div className="flex sm:hidden col-span-2 justify-center space-x-2 -my-1">
                  <MobileLink scheme="dark" href="/about">
                    Reset Password
                  </MobileLink>
                  <MobileLink scheme="dark" href="/about">
                    Create Account
                  </MobileLink>
                </div> */}
              </div>
              <div className="mt-0 md:mt-7 flex flex-wrap justify-center items-center space-x-2">
                <SubLink scheme="dark" href="/about">
                  About
                </SubLink>
                <SubLink scheme="dark" href="/about">
                  Donate
                </SubLink>
                <SubLink scheme="dark" href="/about">
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
