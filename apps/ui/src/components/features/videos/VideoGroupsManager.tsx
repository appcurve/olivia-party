import React, { useCallback, useState } from 'react'
import { ModalVariant, useModalContext } from '@firx/react-modals'
import { Spinner } from '@firx/react-feedback'

import { DataQueryParams, SortType } from '@firx/op-data-api'

import type { VideoDto, VideoGroupDto } from '../../../types/videos.types'
import {
  useVideoGroupCreateQuery,
  useVideoGroupDeleteQuery,
  useVideoGroupMutateQuery,
  useVideoGroupQuery,
  useVideoGroupsDataQuery,
} from '../../../api/hooks/video-groups'
import { VideoGroupForm } from './forms/VideoGroupForm'
import { VideoPlaylist } from './input-groups/VideoPlaylist'
import { ManagerControls } from './input-groups/ManagerControls'
import { VideoSelector } from './input-groups/VideoSelector'
import { useVideosQuery } from '../../../api/hooks/videos'
import { ActionButton } from '../../elements/inputs/ActionButton'
import { useFilterItems } from '../../../hooks/useFilterItems'

export interface VideoGroupsManagerProps {}

export interface VideoSelectorModalBodyProps {
  videoGroup: VideoGroupDto | undefined
  videos: VideoDto[]
  onSaveVideoSelectionAsync: (videoUuids: string[]) => Promise<void>
}

const VideoSelectorModalBody: React.FC<VideoSelectorModalBodyProps> = ({
  videoGroup,
  videos,
  onSaveVideoSelectionAsync,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])

  const handleChangeVideoSelection = useCallback((uuids: string[]): void => {
    setSelectedVideos([...uuids])
  }, [])

  if (!videoGroup) {
    return null
  }

  return (
    <>
      <VideoSelector
        videos={videos ?? []}
        initialSelectedVideoUuids={videoGroup.videos.map((v) => v.uuid)}
        itemsListMinViewportHeight={40}
        itemsListMaxViewportHeight={40}
        onVideoSelectionChange={handleChangeVideoSelection}
      />
      <ActionButton
        scheme="dark"
        appendClassName="mt-4 sm:mt-6"
        // isSubmitting={videoGroupMutateQuery.isLoading}
        onClick={async (): Promise<void> => {
          await onSaveVideoSelectionAsync(selectedVideos)
        }}
      >
        Save
      </ActionButton>
    </>
  )
}

/**
 * Comprehensive component for users to perform CRUD operations on Video Groups and manage the
 * associations of Video <-> Video Group entities.
 */
export const VideoGroupsManager: React.FC<VideoGroupsManagerProps> = () => {
  const [currentVideoGroupUuid, setCurrentVideoGroupUuid] = useState<string | undefined>(undefined)
  const [videoGroupsParams, setVideoGroupsParams] = useState<DataQueryParams<VideoGroupDto>>({ sort: { name: 'asc' } })

  const { data: videos } = useVideosQuery()
  const { data: videoGroups, ...videoGroupsQuery } = useVideoGroupsDataQuery(videoGroupsParams)

  const { data: currentVideoGroup } = useVideoGroupQuery(
    { uuid: currentVideoGroupUuid },
    videoGroups?.find((vg) => vg.uuid === currentVideoGroupUuid),
  )
  const { mutateAsync: createVideoGroupAsync } = useVideoGroupCreateQuery()
  const { mutateAsync: mutateVideoGroupAsync, ...videoGroupMutateQuery } = useVideoGroupMutateQuery()
  const { mutate: deleteVideoGroup, ...videoGroupDeleteQuery } = useVideoGroupDeleteQuery()

  const [searchInputRef, searchResults] = useFilterItems<VideoGroupDto>('name', videoGroups, videoGroupsParams)

  const [showAddVideoGroupModal] = useModalContext(
    {
      title: 'New Playlist',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        videos={videos ?? []}
        create={{
          onCreateAsync: async (formValues): Promise<void> => {
            await createVideoGroupAsync({
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
  )

  const [showEditVideoGroupModal] = useModalContext(
    {
      title: 'Edit Playlist',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoGroupForm
        videos={videos ?? []}
        mutate={{
          data: currentVideoGroup,
          onMutateAsync: async (formValues): Promise<void> => {
            if (!currentVideoGroupUuid) {
              return
            }

            await mutateVideoGroupAsync({
              uuid: currentVideoGroupUuid,
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
    [currentVideoGroup],
  )

  const [showVideoSelectorModal] = useModalContext(
    {
      title: 'Video Playlist',
      subtitle: currentVideoGroup?.name,
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <>
        <VideoSelectorModalBody
          videoGroup={currentVideoGroup}
          videos={videos ?? []}
          onSaveVideoSelectionAsync={async (videoUuids): Promise<void> => {
            if (!currentVideoGroupUuid) {
              return
            }

            await mutateVideoGroupAsync({ uuid: currentVideoGroupUuid, videos: videoUuids })
            hideModal()
          }}
        />
      </>
    ),
    [currentVideoGroup, videos, videoGroups],
  )

  const handleChangeActiveVideoGroup =
    (uuid: string): ((enabled: boolean) => void) =>
    (enabled) => {
      mutateVideoGroupAsync({ uuid, enabled })
    }

  const handleEditVideoGroup =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    (_event) => {
      setCurrentVideoGroupUuid(uuid)
      showEditVideoGroupModal()
    }

  const handleManagePlaylist =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    () => {
      setCurrentVideoGroupUuid(uuid)
      showVideoSelectorModal()
    }

  const handleDeleteVideoGroup =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    (_event) => {
      deleteVideoGroup({
        uuid,
      })
    }

  const handleSortOptionChange = useCallback((sortType: SortType) => {
    setVideoGroupsParams({ sort: { name: sortType } })
  }, [])

  return (
    <>
      {(videoGroupsQuery.isError || videoGroupDeleteQuery.isError) && <p>Error fetching data</p>}
      {videoGroupsQuery.isLoading && <Spinner />}
      <>
        <div className="mb-6">
          <ManagerControls
            labels={{
              search: {
                inputLabel: 'Keyword Filter',
                inputPlaceholder: 'Keyword Filter',
              },
              actions: {
                addButtonCaption: 'Playlist',
              },
            }}
            searchInputRef={searchInputRef}
            onSortOptionChange={handleSortOptionChange}
            onAddClick={showAddVideoGroupModal}
          />
        </div>
        {videoGroupsQuery.isSuccess && !!searchResults?.length && (
          <ul className="relative fx-stack-set-parent-rounded-border-divided-children">
            {searchResults?.map((videoGroup) => (
              <li key={videoGroup.uuid}>
                <VideoPlaylist
                  key={videoGroup.uuid}
                  videoGroup={videoGroup}
                  isActive={!!videoGroup.enabledAt}
                  isActiveToggleLoading={
                    // disable all toggles while loading
                    videoGroupMutateQuery.isLoading
                  }
                  isActiveToggleLoadingAnimated={
                    // animate only the toggle that was changed to not overdo the effect
                    videoGroupMutateQuery.isLoading && videoGroupMutateQuery.variables?.uuid === videoGroup.uuid
                  }
                  onEditClick={handleEditVideoGroup(videoGroup.uuid)}
                  onDeleteClick={handleDeleteVideoGroup(videoGroup.uuid)}
                  onActiveToggleChange={handleChangeActiveVideoGroup(videoGroup.uuid)}
                  onManageVideosClick={handleManagePlaylist(videoGroup.uuid)}
                />
              </li>
            ))}
          </ul>
        )}
      </>
      {videoGroupsQuery.isSuccess && (!videoGroups?.length || !searchResults.length) && (
        <div className="flex items-center border-2 border-dashed rounded-md p-4">
          <div className="text-slate-600">No playlists found.</div>
        </div>
      )}
    </>
  )
}
