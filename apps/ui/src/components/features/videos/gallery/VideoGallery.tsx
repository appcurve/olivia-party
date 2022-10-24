import React, { useCallback } from 'react'
import clsx from 'clsx'
import { decode } from 'html-entities'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/outline'

import type { VideoDto } from '@firx/op-data-api'
import { VideoThumbnail } from '../VideoThumbnail'

export interface VideoGalleryProps {
  videos: Exclude<VideoDto, 'video'>[]
  onAddVideoClick?: React.MouseEventHandler<HTMLButtonElement>
  onEditVideoClick: (videoUuid: string, event: React.MouseEvent | React.KeyboardEvent) => void
  onDeleteVideoClick?: (videoUuid: string, event: React.MouseEvent) => void
}

export interface VideoItemProps {
  video: Pick<VideoDto, 'uuid' | 'name' | 'externalId' | 'platform'>
  onEditVideoClick?: VideoGalleryProps['onEditVideoClick']
  onDeleteVideoClick?: VideoGalleryProps['onDeleteVideoClick']
}

export interface VideoDeleteButtonProps {
  variant: 'full' | 'top-right-corner'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export interface VideoCaptionProps {
  video: VideoItemProps['video']
  hasBorder?: boolean
}

/**
 * Inner-component (child) of video item delete button with border + 'x' icon.
 */
export const VideoDeleteIconButton: React.FC = React.memo(function VideoDeleteIconButton() {
  return (
    <div
      className={clsx(
        'flex items-center justify-center p-2 border rounded-md',
        'bg-P-neutral-100 group-hover:bg-white text-P-error-600 bg-opacity-85',
        'border-P-error-600 border-opacity-90 group-hover:border-opacity-100',
        'group-hover:bg-opacity-100 group-focus:bg-white',
        'transition-colors group-focus-visible:ring-2 group-focus-visible:ring-sky-200',
      )}
    >
      <span className="sr-only">Delete Video</span>
      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
    </div>
  )
})

/**
 * Delete button for individual videos in the gallery.
 * Implemented with absolute positioning so a parent with relative positioning is required.
 *
 * Set `variant` to 'top-right-corner' for top right, and 'full' for a full-height + full-width overlay.
 */
export const VideoDeleteButton: React.FC<VideoDeleteButtonProps> = React.memo(function VideoDeleteButton({
  variant,
  onClick,
}) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (typeof onClick === 'function') {
      onClick(event)
    }

    event.stopPropagation()
  }

  if (variant === 'top-right-corner') {
    return (
      <button type="button" className="absolute group isolate top-0 right-0" onClick={handleClick}>
        <div className="p-1 xs:p-2">
          <VideoDeleteIconButton />
        </div>
      </button>
    )
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={clsx('absolute group isolate h-full w-full inset-0 flex justify-end', 'focus:outline-none')}
        onClick={handleClick}
      >
        <VideoDeleteIconButton />
      </button>
    )
  }

  return null
})

/**
 * Grayscale + opacity filter for video gallery item thumbnails.
 * Applies classNames with tailwindcss' group-hover + group-focus utilities.
 */
const GrayFilter: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div
    className={clsx(
      'opacity-75 filter grayscale-75 w-full h-full transition-all',
      'group-hover:opacity-100 group-focus:opacity-100 group-hover:grayscale-0 group-focus:grayscale-0',
    )}
  >
    {children}
  </div>
)

// /**
//  * Full height + width absolute positioned "cover box" wrapper for video items in a gallery.
//  * Renders a border with consistent round corners and _no_ 1-2px gaps (although there is minor
//  * but tolerable spillover from underlying elements at different scales).
//  *
//  * This component was a workaround for having borders around video items that render with gaps,
//  * presumably due to grid + 16:9 ratio that appeared only when borders are applied.
//  */
// const AbsoluteRoundBorder: React.FC<React.PropsWithChildren> = ({ children }) => {
//   return (
//     <div
//       className={clsx(
//         'absolute h-full w-full inset-0',
//         'flex justify-center items-end',
//         'rounded-md border',
//         'border-P-neutral-200 group-hover:border-P-neutral-300',
//       )}
//     >
//       {children}
//     </div>
//   )
// }

/**
 * Video thumb caption that displays video name.
 */
const VideoCaption: React.FC<VideoCaptionProps> = React.memo(function VideoCaption({ video, hasBorder }) {
  const borderClassName = clsx('border-b border-l border-r border-P-neutral-200 group-hover:border-P-neutral-400')

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 px-2 py-2 sm:px-4 rounded-bl-md rounded-br-md',
        'group-hover:bg-opacity-80 group-focus:bg-opacity-80',
        'text-sm sm:leading-snug',
        'text-white bg-P-neutral-700 bg-opacity-85 transition-all',
        {
          [borderClassName]: hasBorder,
        },
      )}
    >
      <span className="group-hover:[text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">{decode(video.name)}</span>
    </div>
  )
})

/**
 * Action button styled as a skeleton video thumbnail per the Video Gallery component.
 * Faciliates having an 'Add Video' button as the last item in a video gallery.
 *
 * @see VideoGallery
 */
export const VideoGalleryAddVideoButton: React.FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> }> = React.memo(
  function VideoGalleryAddVideoButton({ onClick }) {
    return (
      <button
        type="button"
        className={clsx(
          'group w-full rounded-md aspect-w-16 aspect-h-9 isolate border-2 overflow-hidden',
          'bg-P-neutral-100 border-dashed border-P-neutral-200 hover:border-P-neutral-300 hover:bg-P-neutral-200',
          'transition-all cursor-pointer fx-focus-ring',
        )}
        onClick={onClick}
      >
        <div
          className={clsx(
            'flex flex-col items-center justify-center px-4',
            'transition-colors text-P-primary group-hover:text-P-primary-hover',
          )}
        >
          <PlusIcon className="block h-6 w-6 flex-shrink-0 text-base" />
          <div className="text-sm md:text-base">Add Video</div>
        </div>
      </button>
    )
  },
)

/**
 * Individual video (item) in a `VideoGallery` with a caption and a delete button.
 *
 * @see VideoGallery
 */
export const VideoItem: React.FC<VideoItemProps> = ({ video, onEditVideoClick, onDeleteVideoClick }) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (typeof onEditVideoClick === 'function') {
      onEditVideoClick(video.uuid, event)
    }
  }

  // components behaving as buttons should respond to space and enter when they have focus
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === ' ' || event.key === 'Enter') {
      if (typeof onEditVideoClick === 'function') {
        onEditVideoClick(video.uuid, event)
      }
    }
  }

  const handleDeleteClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (typeof onDeleteVideoClick === 'function') {
        onDeleteVideoClick(video.uuid, event)
      }
    },
    [video, onDeleteVideoClick],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      className="group flex justify-center items-center w-full fx-focus-ring-wide focus:rounded-md "
      aria-roledescription="Edit Video"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={clsx(
          'relative w-full aspect-w-16 aspect-h-9', // object-cover
        )}
      >
        <div className="cursor-pointer">
          <div className="rounded-md overflow-hidden h-full">
            <div className="h-full">
              <GrayFilter>
                <VideoThumbnail externalId={video.externalId} />
              </GrayFilter>
              <VideoCaption video={video} hasBorder={false} />
              {/* <AbsoluteRoundBorder /> */}
            </div>
            {typeof onDeleteVideoClick === 'function' && (
              <VideoDeleteButton variant="top-right-corner" onClick={handleDeleteClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Video Gallery component that renders video thumbnails for each of the given videos,
 * each with CRUD actions.
 */
export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onEditVideoClick,
  onAddVideoClick,
  onDeleteVideoClick,
}) => {
  const handleAddVideoClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (typeof onAddVideoClick === 'function') {
        onAddVideoClick(event)
      }
    },
    [onAddVideoClick],
  )

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 xs:gap-4">
      {videos?.map((video) => (
        <VideoItem
          key={video.uuid}
          video={video}
          onEditVideoClick={onEditVideoClick}
          onDeleteVideoClick={onDeleteVideoClick}
        />
      ))}
      {typeof onAddVideoClick === 'function' && <VideoGalleryAddVideoButton onClick={handleAddVideoClick} />}
    </div>
  )
}
