import React from 'react'
import clsx from 'clsx'
import { Listbox, Transition } from '@headlessui/react'
import { useController, type UseControllerProps } from 'react-hook-form'

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import type { FormOption } from '../types/form-option.interface'
import type { FormElementCommonProps } from '../types/form-element-common-props.interface'
import { FormInputHelperText } from './input-parts/FormInputHelperText'
import { FormInputErrors } from './input-parts/FormInputErrors'

// had considered React.ComponentPropsWithoutRef<'select'> however headless ui Listbox is fairly distinct
export interface FormListBoxProps extends Omit<UseControllerProps, 'rules'>, FormElementCommonProps {
  name: string
  label: string
  options: FormOption[]
  appendClassName?: string
  placeholder?: string
  disabled?: boolean
}

const LABELS = {
  DEFAULT_PLACEHOLDER_PREFIX: 'Select', // example of this prefix in use: 'Select Language'
}

/**
 *
 * Note: HeadlessUI form components manage creation and association of isomorphic-friendly `id`'s.
 *
 * @see {@link https://headlessui.com/react/listbox#listbox}
 * @see {@link https://github.com/tailwindlabs/headlessui/discussions/1041}
 */
export const FormListBox: React.FC<FormListBoxProps> = ({
  name,
  label,
  helperText,
  options,
  appendClassName,
  placeholder,
  readOnly = false,
  hideErrorMessage = false,
  hideLabel = false,
  ...restProps
}) => {
  const { disabled, validationOptions, ...restHookFormProps } = restProps
  const {
    field,
    formState: { isSubmitting, errors },
  } = useController({ name, rules: validationOptions, ...restHookFormProps }) // { control, rule, defaultValue }

  const isInputDisabled = disabled || isSubmitting

  return (
    <div className={appendClassName}>
      <Listbox
        value={field.value}
        onChange={field.onChange}
        as="div"
        disabled={isInputDisabled}
        className="relative group w-full"
        aria-invalid={errors[name] ? 'true' : 'false'}
      >
        {({ open }): JSX.Element => (
          <>
            <Listbox.Label
              // @see FormInputLabel as the following className seeks to replicate styling
              className={clsx('transition-colors duration-100', hideLabel ? 'sr-only' : 'fx-form-label mb-1', {
                ['opacity-80']: isInputDisabled,
              })}
              // as={FormInputLabel} // afaik with headlessui there isn't an elegant way to set props on this
            >
              {label}
            </Listbox.Label>
            <div className="relative">
              <Listbox.Button
                ref={field.ref} // setting this ref enables react-hook-form to set focus to the element on error
                disabled={isInputDisabled}
                className={clsx(
                  'relative group w-full cursor-default rounded-md border text-base',
                  'py-2 pl-3 pr-10 text-left shadow-sm',
                  'border-P-form-input-border',
                  'fx-focus-ring-form focus:border-P-form-input-border',
                  readOnly || isInputDisabled ? 'bg-P-neutral-100 cursor-default' : 'bg-white',
                )}
              >
                <span
                  className={clsx('block truncate', {
                    'text-P-form-input-text': !!field.value,
                    'text-P-form-placeholder': !field.value,
                    'opacity-80': isInputDisabled,
                  })}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)?.label
                    : placeholder ?? `${LABELS.DEFAULT_PLACEHOLDER_PREFIX} ${label}`}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className={clsx('h-5 w-5 text-P-neutral-400', {
                      'group-hover:text-P-neutral-600 group-active:text-P-primary':
                        !!(options && options.length) && !isInputDisabled,
                    })}
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={React.Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  className={clsx(
                    'absolute z-10 mt-1 max-h-60 w-full py-1 overflow-auto rounded-md',
                    'bg-white text-base text-left',
                    'focus:outline-none ring-1 ring-black ring-opacity-5 shadow-lg', // dropdown menu border
                  )}
                >
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.keyValue ?? `${option.label}-${option.value}`}
                      className={({ active }): string =>
                        clsx(
                          active ? 'bg-P-sky-100' : 'text-P-form-input-text',
                          'relative py-2 pl-8 pr-4 cursor-default select-none',
                        )
                      }
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {({ selected, active }): JSX.Element => (
                        <>
                          <span
                            className={clsx(
                              selected ? 'font-medium text-P-form-option-selected' : 'font-normal',
                              'block truncate',
                            )}
                          >
                            {option.label}
                          </span>

                          {selected ? (
                            <span
                              className={clsx(
                                active ? 'text-P-form-option-selected' : 'text-P-form-option-icon',
                                'absolute inset-y-0 left-0 flex items-center pl-1.5',
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
      <FormInputHelperText text={helperText} />
      <FormInputErrors errors={errors} name={name} show={!hideErrorMessage} />
    </div>
  )
}
