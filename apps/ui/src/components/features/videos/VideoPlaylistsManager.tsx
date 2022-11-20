import React, { useCallback, useState } from 'react'
import { ModalVariant, useModalContext } from '@firx/react-modals'
import { Spinner } from '@firx/react-feedback'

import { DataQueryParams } from '@firx/op-data-api'

import type { SortType, VideoDto, VideoPlaylistDto } from '@firx/op-data-api'
import {
  useVideoPlaylistCreateQuery,
  useVideoPlaylistDeleteQuery,
  useVideoPlaylistMutateQuery,
  useVideoPlaylistQuery,
  useVideoPlaylistsDataQuery,
} from '../../../api/hooks/video-playlists'
import { VideoPlaylist } from './input-groups/VideoPlaylist'
import { ManagerControls } from './input-groups/ManagerControls'
import { VideoSelector } from './input-groups/VideoSelector'
import { useVideosQuery } from '../../../api/hooks/videos'
import { ActionButton } from '../../elements/inputs/ActionButton'
import { useFilterItems } from '../../../hooks/useFilterItems'
import { VideoPlaylistForm } from './forms/VideoPlaylistForm'

export interface VideoPlaylistsManagerProps {}

export interface VideoSelectorModalBodyProps {
  videoPlaylist: VideoPlaylistDto | undefined
  videos: VideoDto[]
  onSaveVideoSelectionAsync: (videoUuids: string[]) => Promise<void>
}

const VideoSelectorModalBody: React.FC<VideoSelectorModalBodyProps> = ({
  videoPlaylist,
  videos,
  onSaveVideoSelectionAsync,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])

  const handleChangeVideoSelection = useCallback((uuids: string[]): void => {
    setSelectedVideos([...uuids])
  }, [])

  if (!videoPlaylist) {
    return null
  }

  return (
    <>
      <VideoSelector
        videos={videos ?? []}
        initialSelectedVideoUuids={videoPlaylist.videos.map((v) => v.uuid)}
        itemsListMinViewportHeight={40}
        itemsListMaxViewportHeight={40}
        onVideoSelectionChange={handleChangeVideoSelection}
      />
      <ActionButton
        scheme="dark"
        appendClassName="mt-4 sm:mt-6"
        // isSubmitting={videoPlaylistMutateQuery.isLoading}
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
export const VideoPlaylistsManager: React.FC<VideoPlaylistsManagerProps> = () => {
  const [currentVideoPlaylistUuid, setCurrentVideoPlaylistUuid] = useState<string | undefined>(undefined)
  const [videoPlaylistsParams, setVideoPlaylistsParams] = useState<DataQueryParams<VideoPlaylistDto>>({
    sort: { name: 'asc' },
  })

  const { data: videos } = useVideosQuery()
  const { data: videoPlaylists, ...videoPlaylistsQuery } = useVideoPlaylistsDataQuery(videoPlaylistsParams)

  const { data: currentVideoPlaylist } = useVideoPlaylistQuery({ uuid: currentVideoPlaylistUuid })
  const { mutateAsync: createVideoPlaylistAsync } = useVideoPlaylistCreateQuery()
  const { mutateAsync: mutateVideoPlaylistAsync, ...videoPlaylistMutateQuery } = useVideoPlaylistMutateQuery()
  const { mutate: deleteVideoPlaylist, ...videoPlaylistDeleteQuery } = useVideoPlaylistDeleteQuery()

  const [searchInputRef, searchResults] = useFilterItems<VideoPlaylistDto>('name', videoPlaylists, videoPlaylistsParams)

  const [showAddVideoPlaylistModal] = useModalContext(
    {
      title: 'New Playlist',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoPlaylistForm
        videos={videos ?? []}
        create={{
          onCreateAsync: async (formValues): Promise<void> => {
            await createVideoPlaylistAsync({
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
  )

  const [showEditVideoPlaylistModal] = useModalContext(
    {
      title: 'Edit Playlist',
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <VideoPlaylistForm
        videos={videos ?? []}
        mutate={{
          data: currentVideoPlaylist,
          onMutateAsync: async (formValues): Promise<void> => {
            if (!currentVideoPlaylistUuid) {
              return
            }

            await mutateVideoPlaylistAsync({
              uuid: currentVideoPlaylistUuid,
              ...formValues,
            })

            hideModal()
          },
        }}
      />
    ),
    [currentVideoPlaylist],
  )

  const [showVideoSelectorModal] = useModalContext(
    {
      title: 'Video Playlist',
      subtitle: currentVideoPlaylist?.name,
      variant: ModalVariant.FORM,
    },
    (hideModal) => (
      <>
        <VideoSelectorModalBody
          videoPlaylist={currentVideoPlaylist}
          videos={videos ?? []}
          onSaveVideoSelectionAsync={async (videoUuids): Promise<void> => {
            if (!currentVideoPlaylistUuid) {
              return
            }

            await mutateVideoPlaylistAsync({ uuid: currentVideoPlaylistUuid, videos: videoUuids })
            hideModal()
          }}
        />
      </>
    ),
    [currentVideoPlaylist, videos, videoPlaylists],
  )

  const handleChangeActiveVideoPlaylist =
    (uuid: string): ((enabled: boolean) => void) =>
    (enabled) => {
      mutateVideoPlaylistAsync({ uuid, enabled })
    }

  const handleEditVideoPlaylist =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    (_event) => {
      setCurrentVideoPlaylistUuid(uuid)
      showEditVideoPlaylistModal()
    }

  const handleManagePlaylist =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    () => {
      setCurrentVideoPlaylistUuid(uuid)
      showVideoSelectorModal()
    }

  const handleDeleteVideoPlaylist =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    (_event) => {
      deleteVideoPlaylist({
        uuid,
      })
    }

  const handleSortOptionChange = useCallback((sortType: SortType) => {
    setVideoPlaylistsParams({ sort: { name: sortType } })
  }, [])

  return (
    <>
      {(videoPlaylistsQuery.isError || videoPlaylistDeleteQuery.isError) && <p>Error fetching data</p>}
      {videoPlaylistsQuery.isLoading && <Spinner />}
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
            onAddClick={showAddVideoPlaylistModal}
          />
        </div>
        {videoPlaylistsQuery.isSuccess && !!searchResults?.length && (
          <ul className="relative fx-stack-set-parent-rounded-border-divided-children">
            {searchResults?.map((vp) => (
              <li key={vp.uuid}>
                <VideoPlaylist
                  key={vp.uuid}
                  videoPlaylist={vp}
                  isActive={!!vp.enabledAt}
                  isActiveToggleLoading={
                    // disable all toggles while loading
                    videoPlaylistMutateQuery.isLoading
                  }
                  isActiveToggleLoadingAnimated={
                    // animate only the toggle that was changed to not overdo the effect
                    videoPlaylistMutateQuery.isLoading && videoPlaylistMutateQuery.variables?.uuid === vp.uuid
                  }
                  onEditClick={handleEditVideoPlaylist(vp.uuid)}
                  onDeleteClick={handleDeleteVideoPlaylist(vp.uuid)}
                  onActiveToggleChange={handleChangeActiveVideoPlaylist(vp.uuid)}
                  onManageVideosClick={handleManagePlaylist(vp.uuid)}
                />
              </li>
            ))}
          </ul>
        )}
      </>
      {videoPlaylistsQuery.isSuccess && (!videoPlaylists?.length || !searchResults.length) && (
        <div className="flex items-center border-2 border-dashed rounded-md p-4">
          <div className="text-slate-600">No playlists found.</div>
        </div>
      )}
    </>
  )
}
