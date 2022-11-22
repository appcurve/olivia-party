import React, { useEffect, useMemo } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useIsMounted } from '@firx/react-hooks'

import { Spinner } from '@firx/react-feedback'
import { FormButton } from '@firx/react-forms-rhf'
import { FormInput } from '@firx/react-forms-rhf'
import { FormMultiListBox } from '@firx/react-forms-rhf'
import type { CreateVideoPlaylistDto, UpdateVideoPlaylistDto, VideoDto, VideoPlaylistDto } from '@firx/op-data-api'

export interface CreateVideoPlaylistFormValues extends CreateVideoPlaylistDto {}
export interface MutateVideoPlaylistFormValues extends UpdateVideoPlaylistDto {}

// @todo tighter types so only one of create or mutate can be specified
export interface VideoPlaylistFormProps {
  videos: VideoDto[]
  create?: {
    onCreateAsync: (formValues: CreateVideoPlaylistFormValues) => Promise<void>
    //Success?: (data: VideoPlaylistDto, variables: CreateVideoPlaylistFormValues, context: unknown) => void
  }
  mutate?: {
    data: VideoPlaylistDto | undefined
    showVideosInput?: boolean
    onMutateAsync: (formValues: MutateVideoPlaylistFormValues) => Promise<void>
    // onSuccess?: (data: VideoPlaylistDto, variables: MutateVideoPlaylistFormValues, context: unknown) => void
  }
}

// docs for react-hook-form recommend initializing empty forms to values other than `undefined`
const emptyFormValues: CreateVideoPlaylistFormValues = {
  name: '',
  videos: [],
}

const mapVideoPlaylistDtoToFormValues = (dto?: VideoPlaylistDto): MutateVideoPlaylistFormValues | undefined =>
  dto
    ? {
        name: dto.name,
        videos: dto.videos?.map((video) => video.uuid) ?? [],
      }
    : emptyFormValues

type VideoSelectOption = { value: string; label: string }

const InnerForm: React.FC<{
  videoSelectOptions?: VideoSelectOption[]
  onSubmit: React.FormEventHandler<HTMLFormElement>
}> = ({ videoSelectOptions, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="grid grid-cols-1 gap-2 xs:gap-4">
        <FormInput name="name" label="Name" placeholder="Playlist Name" validationOptions={{ required: true }} />
        {!!videoSelectOptions?.length && (
          <FormMultiListBox
            name="videos"
            label="Videos"
            selectedCountLabelSingular="Video"
            selectedCountLabelPlural="Videos"
            options={videoSelectOptions}
          />
        )}
      </div>
      <FormButton type="submit" scheme="dark" appendClassName="mt-6">
        Save
      </FormButton>
    </form>
  )
}

/**
 * Form component to create + mutate Video Playlists vs. project API. Implemented with react-hook-form.
 *
 * Specify one of the `create` or `mutate` objects via props, including an optional `onSuccess()` callback.
 *
 * @todo VideoPlaylistForm per docs is recommended to initialize defaultValues to non-undefined values e.g. empty string or null
 */
export const VideoPlaylistForm: React.FC<VideoPlaylistFormProps> = ({ videos, create, mutate }) => {
  const getIsMounted = useIsMounted()

  const videoGroupCreateForm = useForm<CreateVideoPlaylistFormValues>({
    defaultValues: emptyFormValues,
  })
  const { handleSubmit: handleCreateSubmit, reset: resetCreateForm } = videoGroupCreateForm

  const initialMutateFormValues = useMemo(() => mapVideoPlaylistDtoToFormValues(mutate?.data), [mutate?.data])
  const videoGroupMutateForm = useForm<MutateVideoPlaylistFormValues>({
    defaultValues: initialMutateFormValues,
  })
  const { handleSubmit: handleMutateSubmit, reset: resetMutateForm } = videoGroupMutateForm

  // const { data: videos } = useVideosQuery()

  const videoSelectOptions: VideoSelectOption[] = useMemo(() => {
    return videos?.map((video) => ({ value: video.uuid, label: video.name })) ?? []
  }, [videos])

  useEffect(() => {
    if (mutate) {
      resetMutateForm(initialMutateFormValues)
    }
  }, [mutate, resetMutateForm, initialMutateFormValues])

  const handleCreateVideoPlaylistSubmit: SubmitHandler<CreateVideoPlaylistFormValues> = async (formValues) => {
    if (!getIsMounted()) {
      return
    }

    try {
      await create?.onCreateAsync(formValues)
      resetCreateForm()
    } catch (error: unknown) {
      // @todo propagate form errors (VideoForm - create case)
      console.error(error instanceof Error ? error.message : String(error))
    }

    // try {
    //   await createVideoPlaylistAsync({ parentContext: parentContext, ...formValues })
    // } catch (error: unknown) {
    //   console.error(error instanceof Error ? error.message : String(error))
    // }
  }

  const handleMutateVideoPlaylistSubmit: SubmitHandler<MutateVideoPlaylistFormValues> = async (formValues) => {
    if (!getIsMounted() || !mutate?.data?.uuid) {
      return
    }

    try {
      await mutate?.onMutateAsync(formValues)
      // resetMutateForm()
    } catch (error: unknown) {
      // @todo propagate form errors (VideoForm - mutate case)
      console.error(error instanceof Error ? error.message : String(error))
    }

    // try {
    //   await mutateVideoPlaylistAsync({
    //     parentContext: parentContext,
    //     uuid: mutate.data.uuid,
    //     ...formValues,
    //   })
    // } catch (error: unknown) {
    //   console.error(error instanceof Error ? error.message : String(error))
    // }
  }

  if (create && mutate) {
    throw new Error('Form component does not support create and mutate props together. Specify one or the other.')
  }

  if (!videos) {
    return <Spinner />
  }

  if (mutate) {
    return (
      <FormProvider {...videoGroupMutateForm}>
        <InnerForm
          videoSelectOptions={mutate.showVideosInput ? videoSelectOptions : undefined}
          onSubmit={handleMutateSubmit(handleMutateVideoPlaylistSubmit)}
        />
      </FormProvider>
    )
  }

  return (
    <FormProvider {...videoGroupCreateForm}>
      <InnerForm
        videoSelectOptions={videoSelectOptions}
        onSubmit={handleCreateSubmit(handleCreateVideoPlaylistSubmit)}
      />
    </FormProvider>
  )
}
