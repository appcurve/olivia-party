import React, { useCallback, useState } from 'react'

import { ModalVariant, useModalContext } from '@firx/react-modals'
import { Spinner } from '@firx/react-feedback'
import { DataQueryParams, type SortType } from '@firx/op-data-api'
import {
  useVideoCreateQuery,
  useVideoDeleteQuery,
  useVideoMutateQuery,
  useVideoQuery,
  useVideosDataQuery,
} from '../../../api/hooks/videos'
import { VideoForm } from './forms/VideoForm'
import { VideoGallery } from './gallery/VideoGallery'
import { ManagerControls } from './input-groups/ManagerControls'
import { VideoDto } from '../../../types/videos.types'
import { useVideoGroupsQuery } from '../../../api/hooks/video-groups'
import { useFilterItems } from '../../../hooks/useFilterItems'

export interface VideosManagerProps {}

/**
 * Comprehensive component for users to perform CRUD operations on Videos via a gallery-style interface.
 */
export const VideosManager: React.FC<VideosManagerProps> = () => {
  const [currentVideo, setCurrentVideo] = useState<string | undefined>(undefined)
  const [videosParams, setVideosParams] = useState<DataQueryParams<VideoDto>>({ sort: { name: 'asc' } })

  const { data: videos, ...videosQuery } = useVideosDataQuery(videosParams)

  const videoQuery = useVideoQuery({ uuid: currentVideo })
  const { mutateAsync: createVideoAsync } = useVideoCreateQuery()
  const { mutateAsync: mutateVideoAsync } = useVideoMutateQuery()
  const videoDeleteQuery = useVideoDeleteQuery()

  const { data: videoGroups } = useVideoGroupsQuery()

  const [searchInputRef, searchResults] = useFilterItems<VideoDto>('name', videos, videosParams)

  const [showAddVideoModal] = useModalContext(
    {
      title: 'Add Video',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoForm
        videoGroups={videoGroups ?? []}
        create={{
          onCreateAsync: async (formValues): Promise<void> => {
            await createVideoAsync({
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
  )

  const [showEditVideoModal] = useModalContext(
    {
      title: 'Edit Video',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoForm
        videoGroups={videoGroups ?? []}
        mutate={{
          data: videoQuery.data,
          onMutateAsync: async (formValues): Promise<void> => {
            if (!currentVideo) {
              return
            }

            await mutateVideoAsync({
              uuid: currentVideo,
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
    [videoQuery.data],
  )

  const handleEditVideoClick = useCallback(
    (uuid: string, _event: React.MouseEvent | React.KeyboardEvent): void => {
      setCurrentVideo(uuid)
      showEditVideoModal()
    },
    [showEditVideoModal],
  )

  const handleDeleteVideoClick = useCallback(
    (uuid: string, _event: React.MouseEvent): void => {
      videoDeleteQuery.mutate({ uuid })
    },
    [videoDeleteQuery],
  )

  const handleSortOptionChange = useCallback((sortType: SortType) => {
    setVideosParams({ sort: { name: sortType } })
  }, [])

  return (
    <>
      {videosQuery.isError && <p>Error fetching data</p>}
      {videoDeleteQuery.error && <p>Error deleting video</p>}
      {videosQuery.isLoading && <Spinner />}
      <div className="mb-6">
        <ManagerControls
          labels={{
            search: {
              inputLabel: 'Keyword Filter',
              inputPlaceholder: 'Keyword Filter',
            },
            actions: {
              addButtonCaption: 'Video',
            },
          }}
          searchInputRef={searchInputRef}
          onSortOptionChange={handleSortOptionChange}
          onAddClick={showAddVideoModal}
        />
      </div>
      {videosQuery.isSuccess && (
        <VideoGallery
          videos={searchResults}
          onAddVideoClick={showAddVideoModal}
          onEditVideoClick={handleEditVideoClick}
          onDeleteVideoClick={handleDeleteVideoClick}
        />
      )}
    </>
  )
}
