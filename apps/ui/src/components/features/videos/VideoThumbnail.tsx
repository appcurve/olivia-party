import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Spinner } from '@firx/react-feedback'
import clsx from 'clsx'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { getYouTubeThumbUrl, YouTubeVideoQuality } from '../../../lib/videos/youtube'

export interface VideoThumbnailProps {
  alt?: string
  externalId: string
  appendClassName?: string

  // @future support for additional video platforms such as Vimeo
  // platform: VideoPlatform
}

/**
 * Downloads and displays the thumbnail of the YouTube video with the given externalId.
 * Shows a spinner during loading and an error state if there is a problem with the video or its thumbnail.
 */
export const VideoThumbnail: React.FC<VideoThumbnailProps> = React.memo(function VideoThumbnail({
  alt,
  externalId,
  appendClassName,
}) {
  const imgRef = useRef<HTMLImageElement>(null)

  const [isValid, setIsValid] = useState<boolean | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const handleImageLoaded = useCallback(() => {
    setIsLoaded(true)

    // the requested youtube medium quality thumb is 320px wide (refer to `src` prop of img tag below)
    // if a video does not exist (404) then an error thumbnail is returned that is smaller than 320px wide
    if (imgRef.current?.width && imgRef.current.width === 320) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [])

  const handleImageError = useCallback((error: unknown) => {
    setIsValid(false)

    console.error(error)
  }, [])

  useEffect(() => {
    const img = imgRef.current

    if (img) {
      img.addEventListener('load', handleImageLoaded)
      img.addEventListener('error', handleImageError)
    }

    return () => {
      img?.removeEventListener('load', handleImageLoaded)
      img?.removeEventListener('error', handleImageError)
    }
  }, [handleImageLoaded, handleImageError, imgRef.current?.complete])

  useEffect(() => {
    if (imgRef.current?.complete) {
      if (isValid) {
        setIsLoaded(true)
      }

      // see above comment within handleImageLoaded() for details on the 320px heuristic
      if (imgRef.current.width === 320) {
        setIsLoaded(true)
        setIsValid(true)
      }
    }
  }, [isValid, imgRef.current?.complete])

  return (
    <div
      className={clsx(
        'flex w-full h-full',
        {
          // considering setting aspect ratio here aspect-*...
          ['animate-pulse']: !isLoaded,
        },
        appendClassName,
      )}
    >
      {!isLoaded && isValid === undefined && (
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      )}
      {isValid === false && (
        <div className="flex items-center justify-center flex-1">
          <ExclamationTriangleIcon className="h-6 w-6 text-slate-500" aria-hidden="true" />
        </div>
      )}
      {/* @todo deal with nextjs and its Image element (it will not pass a ref due to its implementation) */}
      {/* @see https://nextjs.org/docs/api-reference/next/image#onloadingcomplete for alternative */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={getYouTubeThumbUrl(externalId, YouTubeVideoQuality.MED)}
        alt={alt ?? 'Video Thumbnail'}
        style={isLoaded && isValid ? { display: 'inline-block' } : { display: 'none' }}
        className={clsx('object-fit w-full', {
          ['inline-block']: isLoaded && isValid,
          ['hidden']: !isLoaded || !isValid,
        })}
      />
    </div>
  )
})
