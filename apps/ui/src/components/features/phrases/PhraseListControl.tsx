import React from 'react'

import { PhraseListDto } from '@firx/op-data-api'
import { ToggleSwitch } from '../../elements/inputs/ToggleSwitch'
import clsx from 'clsx'
import { OptionsMenu } from '../videos/menus/OptionsMenu'
import { ListBulletIcon, XCircleIcon } from '@heroicons/react/20/solid'

export interface PhraseListControlProps {
  phraseList: PhraseListDto
  isToggleLoading?: boolean
  isToggleDisabled?: boolean
  onEditClick: React.MouseEventHandler
  onDeleteClick: React.MouseEventHandler
  onEnabledChange: ((uuid: string, enabled: boolean) => void) | ((uuid: string, enabled: boolean) => Promise<void>)
}

export const PhraseListControl: React.FC<PhraseListControlProps> = ({
  phraseList,
  isToggleLoading,
  isToggleDisabled,
  onEditClick,
  onDeleteClick,
  onEnabledChange,
}) => {
  return (
    <div className="relative flex [&>*]:py-4 transition-colors hover:bg-P-neutral-50">
      <div className={clsx('flex items-center justify-center flex-shrink-0 pl-2 xxs:pl-4 pr-1 xxs:pr-2')}>
        <ToggleSwitch
          label="Toggle if this List of Phrases is active or not"
          toggleState={!!phraseList.enabled}
          isLoading={isToggleLoading}
          isDisabled={isToggleDisabled}
          onToggleChange={(nextState: boolean): void | Promise<void> => onEnabledChange(phraseList.uuid, nextState)}
        />
      </div>
      <div className="flex flex-1 pl-1 xxs:pl-2">
        <button className={clsx('flex-1 text-sm text-left fx-focus-ring focus:rounded-sm')} onClick={onEditClick}>
          <div className="text-P-heading capitalize">{phraseList.name}</div>
          <div className="text-P-subheading">{phraseList.phrases.length} Phrases</div>
          <div></div>
        </button>
      </div>
      <div className={clsx('relative flex items-center space-x-2 px-2 xxs:px-4')}>
        <OptionsMenu
          items={[
            {
              label: 'Edit Phrases',
              SvgIcon: ListBulletIcon,
              onClick: onEditClick,
            },
            {
              label: 'Delete Phrase List',
              SvgIcon: XCircleIcon,
              onClick: onDeleteClick,
            },
          ]}
        />
      </div>
    </div>
  )
}
