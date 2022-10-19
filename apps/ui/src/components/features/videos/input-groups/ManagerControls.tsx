import React from 'react'
import clsx from 'clsx'

import { PlusIcon } from '@heroicons/react/20/solid'

import { SearchSortInput, type SearchSortInputProps } from '../../../elements/inputs/SearchSortInput'

export interface ManagerControlsProps {
  labels: {
    search: {
      inputLabel: string
      inputPlaceholder: string
    }
    actions: {
      addButtonCaption: string
    }
  }
  searchInputRef?: React.RefObject<HTMLInputElement>
  onAddClick: React.MouseEventHandler<HTMLButtonElement>
  onSearchInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSortOptionChange: SearchSortInputProps['onSortOptionChange']
}

/**
 * Top control/action bar for groups of items (e.g. Videos, Video Groups) featuring a `SearchSortInput`
 * and an 'Add Item' button.
 */
export const ManagerControls: React.FC<ManagerControlsProps> = ({
  labels,
  searchInputRef,
  onAddClick,
  onSearchInputChange,
  onSortOptionChange,
}) => {
  return (
    <div className="block sm:flex sm:items-center sm:justify-between space-y-2 sm:space-y-0">
      <div className="flex-1">
        <SearchSortInput
          ref={searchInputRef}
          label={labels.search.inputLabel}
          placeholder={labels.search.inputPlaceholder}
          onSearchInputChange={onSearchInputChange}
          onSortOptionChange={onSortOptionChange}
        />
      </div>
      <div className="flex justify-end xs:justify-start sm:pl-4">
        <button
          type="button"
          className={clsx(
            'inline-flex items-center justify-center px-4 py-2 rounded-md border bg-white',
            'font-medium tracking-tight text-P-primary shadow-sm',
            'fx-focus-ring-form hover:bg-P-neutral-100 hover:border-P-primary-hover',
            'border-P-neutral-300',
            'transition-colors focus:bg-sky-50 focus:text-P-primary',
          )}
          onClick={onAddClick}
        >
          <PlusIcon className="h-5 w-5 mr-1 text-P-primary" aria-hidden="true" />
          {labels.actions.addButtonCaption}
        </button>
      </div>
    </div>
  )
}
