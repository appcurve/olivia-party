import React from 'react'
import { Transition } from '@headlessui/react'
import { toast, resolveValue, type Toast } from 'react-hot-toast'
import clsx from 'clsx'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import { Spinner } from '@firx/react-feedback'

export interface CustomToastBarProps {
  t: Toast
}

/**
 * Custom replacement for react-hot-toast's ToastBar component styled with tailwind to reflect project look-and-feel.
 *
 * @see NotificationToaster
 */
export const CustomToastBar: React.FC<CustomToastBarProps> = ({ t }) => {
  return (
    <Transition
      appear
      show={t.visible}
      as={React.Fragment}
      enter="transform transition ease-out duration-300"
      enterFrom="opacity-0 scale-50 translate-y-2 sm:translate-y-0 sm:translate-x-2"
      enterTo="opacity-100 scale-100 translate-y-0 sm:translate-x-0"
      leave="transition ease-in duration-250"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-75"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex">
            <div
              className={clsx('flex-shrink-0', {
                // compensate for viewport on hero svg icons for improved vertical center
                ['pt-0.5']: !t.icon && t.type !== 'loading',
              })}
            >
              {t.icon ? (
                resolveValue(t.icon, t)
              ) : (
                <>
                  {t.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />}
                  {t.type === 'error' && (
                    <ExclamationTriangleIcon className="h-6 w-6 text-P-error-400" aria-hidden="true" />
                  )}
                  {t.type === 'loading' && <Spinner size="sm" color="brand" />}
                </>
              )}
            </div>
            <div
              role="status" // icon + dismiss buttons are not part of the aria role for status
              aria-live={t.type === 'error' ? 'assertive' : 'polite'}
              className="ml-3 w-0 flex-1 cursor-default"
            >
              <p className="text-base font-normal text-P-neutral-800">{resolveValue(t.message, t)}</p>
              {/*
                // example design for two level title + description toast:
                <p className="text-sm font-medium text-P-neutral-900">Successfully saved!</p>
                <p className="mt-1 text-sm text-P-neutral-500">{resolveValue(t.message, t)}</p>
              */}
            </div>
            {t.type !== 'loading' && (
              <div className="flex items-center ml-4 flex-shrink-0">
                <button
                  type="button"
                  className="group focus:outline-none p-4 -m-4 inline-flex rounded-md bg-white text-P-neutral-400 hover:text-P-neutral-500"
                  onClick={(): void => toast.dismiss(t.id)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="group-fx-focus-ring h-5 w-5 group-focus:rounded-sm" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Transition>
  )
}
