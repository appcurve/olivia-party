import React, { useCallback, useId } from 'react'
import clsx from 'clsx'

import { BarsArrowDownIcon, BarsArrowUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

import type { SortType } from '@firx/op-data-api'
import { DropDownMenu } from '../menus/DropDownMenu'

export interface SearchSortInputProps {
  /** Optional `id` of underlying input element. If not provided, an SSR-friendly id is generated. */
  id?: string

  /** Optional name for search input (default: "search"). */
  name?: string

  /** Label for the search input. This value is made available to screen-readers. */
  label: string

  /** Search input placeholder. */
  placeholder: string

  /** Optionally override the `type` of the underlying input element (default: "search"). */
  type?: React.ComponentPropsWithRef<'input'>['type']

  /** Append additional classes to parent div. Intended + safe for adding margins + spacing vs. customization. */
  appendClassName?: string

  /**
   * Optional handler for search input `ChangeEvent`.
   * Provide a handler in cases where a listener is not attached to the input via ref.
   */
  onSearchInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void

  /** Function called with the new sort when the type is changed. */
  onSortOptionChange: (sortType: SortType) => void
}

const LABELS = {
  SORT: 'Sort',
  SORT_ASCENDING: 'Sort A-Z Ascending',
  SORT_DESCENDING: 'Sort Z-A Descending',
}

/**
 * Sort menu button to activate the sort options dropdown of its parent `SearchSortInput` component.
 *
 * Ref + props are forwarded to the underlying button element to facilitate integration with third-party libraries
 * including @headlessui/react.
 *
 * @see SearchSortInput
 */
const SortMenuButton = React.forwardRef<HTMLButtonElement>(function SortMenuButton(props, forwardRef) {
  return (
    <button
      ref={forwardRef}
      type="button"
      className={clsx(
        'group relative -ml-px flex items-center px-2.5 xs:px-4 py-2 border rounded-r-md',
        'min-h-full', // important for full height within parent SearchSortInput
        'border-P-neutral-300 bg-P-neutral-50 hover:bg-P-neutral-100 focus:bg-sky-50',
        'text-sm font-medium text-P-neutral-700 hover:text-P-primary-hover focus:text-P-primary-hover',
        'fx-focus-ring-form',

        // custom tailwindcss variants courtesy of the plugin `@headlessui/tailwindcss`
        'ui-open:bg-sky-50 ui-open:text-P-neutral-400',
        'ui-open:outline-none ui-open:border-P-neutral-300 ui-open:ring-2 ui-open:ring-sky-100',
      )}
      {...props}
    >
      <BarsArrowUpIcon className="h-5 w-5 text-P-neutral-400 ui-open:text-P-neutral-400/60" aria-hidden="true" />
      <span className="hidden xs:inline-block ml-2 text-P-neutral-600 ui-open:text-P-neutral-500/80">
        {LABELS.SORT}
      </span>
      <ChevronDownIcon
        className="ml-1 xs:ml-2.5 -mr-1.5 h-5 w-5 text-P-neutral-400 ui-open:text-P-neutral-400/60"
        aria-hidden="true"
      />
    </button>
  )
})

/**
 * Search input with accompanying dropdown to choose sort order.
 *
 * Refs are forwarded to the underlying search input. Exported as a memoized component.
 */
const SearchSortInputComponent = React.forwardRef<HTMLInputElement, SearchSortInputProps>(function SearchSortInput(
  { id, name, label, type, placeholder, appendClassName, onSearchInputChange, onSortOptionChange },
  forwardRef,
) {
  const safeId = useId()
  const searchInputId = id ?? safeId

  const handleSortOptionClick = useCallback(
    (sortType: SortType): React.MouseEventHandler<HTMLAnchorElement> =>
      () => {
        onSortOptionChange(sortType)
      },
    [onSortOptionChange],
  )

  return (
    <div className={clsx('max-w-lg', appendClassName)}>
      <label htmlFor={searchInputId} className="sr-only">
        {label}
      </label>
      <div className="flex rounded-md shadow-sm">
        <div className="group relative flex-grow focus-within:z-10">
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
              'text-P-neutral-400 group-focus-within:text-P-primary/70 transition-colors',
            )}
          >
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <input
            ref={forwardRef}
            id={searchInputId}
            type={type ?? 'search'}
            name={name ?? 'search'}
            className={clsx(
              // note: .fx-focus-ring is overridden due to specificity so explicit classes added below for now
              'block w-full pl-10 min-w-[12rem] rounded-none rounded-l-md border-P-neutral-300',
              'placeholder:tracking-tight',
              'focus:outline-none focus:ring-2 focus:border-P-neutral-300 focus:ring-sky-100',
              'text-P-neutral-800',
            )}
            placeholder={placeholder}
            spellCheck={false}
            onChange={onSearchInputChange}
          />
        </div>
        <DropDownMenu
          items={[
            {
              label: LABELS.SORT_ASCENDING,
              SvgIcon: BarsArrowUpIcon,
              onClick: handleSortOptionClick('asc'),
            },
            {
              label: LABELS.SORT_DESCENDING,
              SvgIcon: BarsArrowDownIcon,
              onClick: handleSortOptionClick('desc'),
            },
          ]}
          MenuButton={SortMenuButton}
        />
      </div>
    </div>
  )
})

export const SearchSortInput = React.memo(SearchSortInputComponent)
