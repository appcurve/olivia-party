import React, { Fragment, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Menu, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useAuthSignOut } from '../../../api/hooks/auth'
import { useIsMounted } from '@firx/react-hooks'

const DEFAULT_SIGN_OUT_REDIRECT_PATH = '/'

export interface UserProfileMenuProps {
  name: string
}

const menuItems = ['My Profile', 'Settings', 'Sign Out'] as const

/**
 * Drop-down menu (for desktop viewports) with options relevant to the user's session + preferences,
 * including sign-out.
 *
 * The first initial is rendered inside an avatar-esque circle.
 */
export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ name }) => {
  const { push: routerPush } = useRouter()

  const isMounted = useIsMounted()
  const { signOut, isSuccess: isSignOutSuccess } = useAuthSignOut()

  useEffect(() => {
    if (isSignOutSuccess && isMounted()) {
      routerPush(DEFAULT_SIGN_OUT_REDIRECT_PATH)
    }
  }, [isSignOutSuccess, isMounted, routerPush])

  const handleMenuItemClick = useCallback(
    (item: typeof menuItems[number]) => (_event: React.MouseEvent<HTMLButtonElement>) => {
      switch (item) {
        case 'My Profile': {
          routerPush('/app/profile')
          break
        }
        case 'Settings': {
          routerPush('/app/settings')
          break
        }
        case 'Sign Out': {
          signOut()
          break
        }
      }
    },
    [routerPush, signOut],
  )

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={clsx(
          'flex items-center justify-center w-10 h-10 border-[3px] rounded-full',
          'text-sm font-normal text-P-button-primary focus:text-P-button-primary-hover transition-colors',
          'bg-white/25 border-P-button-primary hover:bg-white',
          'fx-focus-ring-form focus:border-P-button-primary-hover focus:bg-white/40',
        )}
      >
        <span className="inline-block leading-none font-semibold">{name.charAt(0).toUpperCase()}</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute right-0 w-40 mt-1 z-30 origin-top-right overflow-hidden rounded-md',
            'bg-white shadow-lg text-base text-P-neutral-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-100',
          )}
        >
          <div className="divide-y divide-P-neutral-200">
            {menuItems.map((item) => (
              <Menu.Item key={item}>
                {({ active }): JSX.Element => (
                  <button
                    className={clsx('group flex items-center w-full px-3 py-2 hover:bg-P-neutral-100', {
                      'text-P-neutral-600': !active,
                      'text-P-neutral-800': active,
                    })}
                    onClick={handleMenuItemClick(item)}
                  >
                    {item}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
