import React from 'react'
import clsx from 'clsx'
import { Menu, Transition } from '@headlessui/react'

import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

export interface OptionsMenuItem {
  label: string
  SvgIcon?: React.FC<React.ComponentProps<'svg'>>
  onClick: React.MouseEventHandler<HTMLAnchorElement>
}

export interface OptionsMenuProps {
  items: OptionsMenuItem[]
  a11y?: {
    menuButtonCaption?: string
  }
}

const LABELS = {
  A11Y_DEFAULT_MENU_BUTTON: 'Open options menu',
}

const menuButtonClassName = clsx(
  'flex items-center p-2 rounded-md border',
  'text-P-neutral-400 hover:text-P-primary-hover',
  'fx-focus-ring-form hover:bg-P-neutral-50 hover:border-P-primary-alpha',
  'border-P-neutral-300 text-sm bg-white focus:shadow-sm hover:shadow-sm',
  'transition-colors focus:bg-P-focus-light focus:text-P-primary',

  // custom tailwindcss variants courtesy of the plugin `@headlessui/tailwindcss`
  'ui-open:bg-P-focus-light ui-open:text-P-neutral-400',
  'ui-open:outline-none ui-open:border-P-neutral-300 ui-open:ring-2 ui-open:ring-P-focus-ring',
)

/*
// future - consider how original tailwindui uses hidden round w/ padding for larger tap target size w/ -'ve margin
<Menu.Button className="-m-2 flex items-center rounded-full p-2 text-slate-400 hover:text-slate-600">
  <span className="sr-only">Open options menu</span>
  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
</Menu.Button>
*/

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ items, a11y }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={menuButtonClassName}>
        <span className="sr-only">{a11y?.menuButtonCaption ?? LABELS.A11Y_DEFAULT_MENU_BUTTON}</span>
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 text-sm font-normal">
            {items.map((item) => (
              <Menu.Item key={item.label}>
                {({ active }): JSX.Element => (
                  <a
                    role="menuitem"
                    className={clsx(
                      'flex items-center px-4 py-2 cursor-pointer',
                      active ? 'bg-P-neutral-100 text-P-neutral-900' : 'text-P-neutral-700',
                    )}
                    onClick={item.onClick}
                  >
                    {!!item.SvgIcon && (
                      <item.SvgIcon
                        className={clsx('mr-3 h-5 w-5 text-P-neutral-400', {
                          ['text-P-primary/100']: active,
                        })}
                        aria-hidden="true"
                      />
                    )}
                    <span className="leading-none">{item.label}</span>
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
