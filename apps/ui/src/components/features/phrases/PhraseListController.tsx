import React from 'react'

import { PhraseListDto } from '@firx/op-data-api'
import { ToggleSwitch } from '../../elements/inputs/ToggleSwitch'
import clsx from 'clsx'

export interface PhraseListControllerProps {
  phraseList: PhraseListDto
  // isActive: boolean
  // isActiveToggleLoading?: boolean
  // isActiveToggleLoadingAnimated?: boolean
  // onEditClick?: React.MouseEventHandler<HTMLAnchorElement>
  // onDeleteClick?: React.MouseEventHandler<HTMLAnchorElement>
  // onManagePhrasesClick: React.MouseEventHandler
  onEnabledChange: ((uuid: string, enabled: boolean) => void) | ((uuid: string, enabled: boolean) => Promise<void>)
}

export const PhraseListController: React.FC<PhraseListControllerProps> = ({ phraseList, onEnabledChange }) => {
  return (
    <div className="relative flex flex-wrap transition-colors [&>*]:py-4">
      <div className={clsx('flex items-center justify-center flex-shrink-0 pl-2 xxs:pl-4 pr-1 xxs:pr-2')}>
        <ToggleSwitch
          label="Toggle if this List of Phrases is active or not"
          toggleState={!!phraseList.enabled}
          onToggleChange={(nextState: boolean): void | Promise<void> => onEnabledChange(phraseList.uuid, nextState)}
        />
      </div>
      <div>
        <div>{phraseList.name}</div>
        <div>{String(phraseList.phrases)}</div>
      </div>
    </div>
  )
}
