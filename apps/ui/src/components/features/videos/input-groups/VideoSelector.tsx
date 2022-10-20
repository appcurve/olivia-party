import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

import { CheckIcon } from '@heroicons/react/24/outline'

import type { VideoDto } from '../../../../types/videos.types'
import { SearchSortInput } from '../../../elements/inputs/SearchSortInput'
import { VideoThumbnail } from '../VideoThumbnail'
import { useSearchFilter } from '../../../../hooks/useSearchFilter'
import { decode } from 'html-entities'

export interface VideoSelectorProps {
  /** Array of available videos to select from. */
  videos: VideoDto[]

  /** Array of UUID's of initially selected videos (UUID's must correspond to a subset of the given `videos`). */
  initialSelectedVideoUuids: string[]

  /** Append className to outer wrapping element - intended for positioning/margins vs. design overrides. */
  appendClassName?: string

  /** Max height of the items list as a number in vh units (e.g. `40`). */
  itemsListMinViewportHeight?: number

  /** Max height of the items list as a number in vh units (e.g. `40`). */
  itemsListMaxViewportHeight: number

  /** Function to call with an updated array of video UUID's when videos are added/removed from the selection. */
  onVideoSelectionChange?: (videoUuids: string[]) => void
}

export interface VideoItemProps {
  name: string
  externalId: string
  isSelected: boolean
  onVideoClick: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Individual video, part of `VideoSelector` implementation.
 */
const VideoItem: React.FC<VideoItemProps> = ({ name, externalId, isSelected, onVideoClick }) => {
  const decodedName = decode(name)

  return (
    <button
      className={clsx(
        'relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer',
        'text-left transition-all',
        'fx-focus-ring-wide focus:ring-inset',
        {
          ['bg-P-neutral-300 hover:bg-P-neutral-400/50']: isSelected,
          ['bg-P-neutral-100 hover:bg-P-neutral-200/75']: !isSelected,
        },
      )}
      onClick={onVideoClick}
    >
      <div
        className={clsx(
          // w-24 h-[3.375rem] has a 16:9 aspect ratio
          'relative flex justify-center items-center flex-shrink-0 w-24 h-[3.375rem] rounded-md overflow-hidden',
          'bg-P-neutral-300 transition-all',
        )}
      >
        <VideoThumbnail externalId={externalId} />
        <div
          className={clsx(
            'absolute justify-center items-center top-0 left-0 w-full h-full',
            'bg-P-neutral-600 bg-opacity-50',
            {
              ['flex']: isSelected,
              ['hidden']: !isSelected,
            },
          )}
        >
          <div className="p-2 rounded-full bg-white bg-opacity-80">
            <CheckIcon className="h-5 w-5 text-P-neutral-800" />
          </div>
        </div>
      </div>
      <div className="w-full px-2 text-sm leading-[1.25] break-normal">
        {/* 50 chars fits 3 lines (when 2 column grid) w/ likely font faces with all-caps */}
        {/* 100 chars fits 2 lines (when 1 column grid) on most screens w/ likely font faces with all-caps */}
        {/* @future could use js measured screen size or otherwise dynamically truncate via js */}
        <span className="inline md:hidden">
          {decodedName.substring(0, 100).trim()}
          {decodedName.length > 100 && <>&hellip;</>}
        </span>
        <span className="hidden md:inline">
          {decodedName.substring(0, 50).trim()}
          {decodedName.length > 50 && <>&hellip;</>}
        </span>
      </div>
    </button>
  )
}

/**
 * Simple pluralize function that appends an 's' to the given string if the given count >1.
 */
const pluralize = (input: string, count: number): string => {
  return `${input}${count <= 1 ? '' : 's'}`
}

/**
 * Comination video selector component with search filter.
 *
 * Lists the given videos and calls the `onVideoSelectionChange()` function
 */
export const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  itemsListMinViewportHeight,
  itemsListMaxViewportHeight,
  initialSelectedVideoUuids,
  appendClassName,
  onVideoSelectionChange,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>(initialSelectedVideoUuids)
  const [handleSearchInputChange, filteredVideos, searchInputRef] = useSearchFilter<VideoDto>('name', videos ?? [])

  const handleSelectVideo =
    (selectedVideoUuid: string): React.MouseEventHandler<HTMLButtonElement> =>
    () => {
      setSelectedVideos((uuids) => {
        const filtered = uuids.filter((uuid) => uuid !== selectedVideoUuid)

        if (filtered.length < uuids.length) {
          return filtered
        }

        filtered.push(selectedVideoUuid)
        return filtered
      })
    }

  useEffect(() => {
    if (typeof onVideoSelectionChange === 'function') {
      onVideoSelectionChange(selectedVideos)
    }
  }, [onVideoSelectionChange, selectedVideos, selectedVideos.length])

  if (itemsListMinViewportHeight && (itemsListMinViewportHeight < 0 || itemsListMinViewportHeight > 100)) {
    throw Error('Invalid value for VideoSelector items list min viewport height: unit must be a valid vh unit.')
  }

  if (itemsListMaxViewportHeight < 0 || itemsListMaxViewportHeight > 100) {
    throw Error('Invalid value for VideoSelector items list max viewport height: unit must be a valid vh unit.')
  }

  const itemsListMinMaxHeightStyle = {
    maxHeight: `${itemsListMaxViewportHeight}vh`,
    ...(itemsListMinViewportHeight ? { minHeight: `${itemsListMinViewportHeight}vh` } : {}),
  }

  return (
    <div className={clsx('w-full', appendClassName)}>
      <SearchSortInput
        ref={searchInputRef}
        label="Filter Videos"
        placeholder="Filter Videos"
        appendClassName="mx-auto"
        onSearchInputChange={handleSearchInputChange}
        showSelectSortOption={false}
      />
      <div
        className={clsx(
          'block xxs:flex xxs:justify-between w-full xxs:space-x-4 my-1 xxs:my-2 p-2 rounded-md',
          'text-xs text-P-neutral-600 text-center bg-transparent',
        )}
      >
        {/* display number of videos selected */}
        <div>{`${selectedVideos.length} ${pluralize('Video', selectedVideos.length)}`} Selected</div>

        {/* display total number of videos */}
        <div className="italic">
          {filteredVideos.length === videos.length
            ? `${videos.length} Videos Available`
            : filteredVideos.length === 0
            ? 'No matches found'
            : `${filteredVideos.length} ${pluralize('match', filteredVideos.length)} of ${videos.length} videos`}
        </div>
      </div>
      {filteredVideos.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-max overflow-y-scroll"
          style={itemsListMinMaxHeightStyle}
        >
          {filteredVideos.map((video) => (
            <VideoItem
              key={video.uuid}
              name={video.name}
              externalId={video.externalId}
              isSelected={!!selectedVideos.find((uuid) => uuid === video.uuid)}
              onVideoClick={handleSelectVideo(video.uuid)}
            />
          ))}
        </div>
      )}
      {filteredVideos.length === 0 && (
        <div
          className="flex justify-center items-center text-center text-sm text-P-neutral-500 italic"
          style={itemsListMinMaxHeightStyle}
        >
          {videos.length === 0
            ? 'No videos to display.'
            : `No matches found for search "${searchInputRef.current?.value}".`}
        </div>
      )}
    </div>
  )
}
