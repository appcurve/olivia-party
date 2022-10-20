import React, { useCallback } from 'react'
import clsx from 'clsx'

import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { XCircleIcon } from '@heroicons/react/20/solid'
import { RiPlayList2Line } from 'react-icons/ri'

import type { VideoGroupDto } from '../../../../types/videos.types'
import { OptionsMenu } from '../menus/OptionsMenu'
import { ToggleSwitch, ToggleSwitchProps } from '../../../elements/inputs/ToggleSwitch'
import { ToolbarButton } from '../../../elements/inputs/ToolbarButton'

export interface VideoPlaylistProps {
  videoGroup: VideoGroupDto
  isActive: boolean
  isActiveToggleLoading?: boolean
  isActiveToggleLoadingAnimated?: boolean
  onEditClick?: React.MouseEventHandler<HTMLAnchorElement>
  onDeleteClick?: React.MouseEventHandler<HTMLAnchorElement>
  onManageVideosClick: React.MouseEventHandler
  onActiveToggleChange: ToggleSwitchProps['onToggleChange']
}

interface VideoGroupSummaryProps {
  duration?: number
  count: number
}

/**
 * Display basic Video Group stats inline. Part of `VideoGroupsListItem`.
 */
const VideoGroupSummary: React.FC<VideoGroupSummaryProps> = ({ duration, count }) => {
  return (
    <span>
      {duration ? `${duration} - ` : ''} {count} {`${count === 1 ? 'video' : 'videos'}`}
    </span>
  )
}

const LABELS = {
  VIDEOS: 'Videos',
  SELECT_VIDEOS: 'Select Videos',
  MANAGE_PLAYLIST: 'Manage Videos',
  EDIT_PLAYLIST_NAME: 'Edit Name',
  EDIT_DETAILS: 'Edit Details',
  DELETE_PLAYLIST: 'Delete Playlist',
}

/**
 * A single Video Playlist (Video Group) item that implements features to manage the playlist.
 *
 * Renders a row-like component with an active/inactive toggle, a 'manage videos' button,
 * and menu to edit + delete.
 *
 * A dumb display component that requires its state and event handlers to be provided and managed
 * by a parent via props.
 */
export const VideoPlaylist: React.FC<VideoPlaylistProps> = React.memo(function VideoPlaylist({
  videoGroup,
  isActive,
  isActiveToggleLoading,
  isActiveToggleLoadingAnimated,
  onEditClick,
  onDeleteClick,
  onActiveToggleChange,
  onManageVideosClick,
}) {
  const handleEditClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      if (typeof onEditClick === 'function') {
        onEditClick(event)
      }
    },
    [onEditClick],
  )

  const handleDeleteClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      if (typeof onDeleteClick === 'function') {
        onDeleteClick(event)
      }
    },
    [onDeleteClick],
  )

  return (
    <div
      // for css border definitions refer to parent ul.fx-stack-set-parent-rounded-border-divided-children
      // (custom class in tailwind-preset) - note active items will have z-20 applied via fx-active class
      className={clsx('relative flex flex-wrap transition-colors [&>*]:py-4', {
        ['bg-P-item-selected hover:bg-P-item-selected-hover fx-active']: isActive,
        ['bg-transparent hover:bg-P-neutral-50']: !isActive,
      })}
    >
      <div className={clsx('flex items-center justify-center flex-shrink-0 pl-2 xxs:pl-4 pr-1 xxs:pr-2')}>
        <ToggleSwitch
          label="Toggle if this Video Group is active or not"
          toggleState={isActive}
          isLoading={isActiveToggleLoading}
          isLoadingAnimated={isActiveToggleLoadingAnimated}
          onToggleChange={onActiveToggleChange}
        />
      </div>
      <div className={clsx('group flex space-x-4 items-center w-full flex-1 cursor-pointer pl-1 xxs:pl-2 pr-2')}>
        <button
          className={clsx('flex-1 text-left fx-focus-ring focus:rounded-sm', {
            ['fx-focus-ring-mod-darker']: isActive,
          })}
          onClick={onManageVideosClick}
        >
          <div
            className={clsx('block mb-1 font-normal text-sm xs:text-base text-P-heading leading-tight xs:leading-snug')}
          >
            <div className="text-P-subheading">{videoGroup.name}</div>
          </div>
          <div className="block text-sm leading-4 text-P-subheading">
            <VideoGroupSummary count={videoGroup.videos.length} />
          </div>
        </button>
        <div className="hidden xs:block">
          <ToolbarButton SvgIcon={RiPlayList2Line} onClick={onManageVideosClick} />
        </div>
      </div>
      <div className={clsx('relative flex items-center space-x-2 pr-2 xxs:pr-4')}>
        <OptionsMenu
          items={[
            {
              label: LABELS.EDIT_PLAYLIST_NAME,
              SvgIcon: PencilSquareIcon,
              onClick: handleEditClick,
            },
            {
              label: LABELS.MANAGE_PLAYLIST,
              SvgIcon: RiPlayList2Line,
              onClick: onManageVideosClick,
            },
            {
              label: LABELS.DELETE_PLAYLIST,
              SvgIcon: XCircleIcon,
              onClick: handleDeleteClick,
            },
          ]}
        />
      </div>
    </div>
  )
})
