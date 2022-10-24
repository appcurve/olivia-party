import { useEffect } from 'react'
import type { NextPage } from 'next'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { UserProfileDto } from '@firx/op-data-api'
import { useUserProfileMutateQuery, useUserProfileQuery } from '../../api/hooks/user'
import { PageHeading } from '../../components/elements/headings/PageHeading'
import { useAuthSession } from '../../context/SessionContextProvider'
import { FormButton, FormContainer, FormInput, FormTextArea } from '@firx/react-forms-rhf'

export const UserProfilePage: NextPage = (_props) => {
  const session = useAuthSession()

  const userProfileQuery = useUserProfileQuery()
  const mutateUserProfileQuery = useUserProfileMutateQuery()

  const userProfileForm = useForm<UserProfileDto>({
    defaultValues: { bio: '', locale: '', tz: '' },
  })

  const { handleSubmit, reset } = userProfileForm

  useEffect(() => {
    reset(userProfileQuery.data)
  }, [userProfileQuery.data, reset])

  const handleUpdateProfile: SubmitHandler<UserProfileDto> = async (formValues) => {
    await mutateUserProfileQuery.mutateAsync(formValues)
  }

  return (
    <>
      <PageHeading>My Profile</PageHeading>
      <FormContainer>
        <p className="mb-4 text-lg text-center text-P-primary">
          {session.profile.name} ({session.profile.email})
        </p>
        <FormProvider {...userProfileForm}>
          <form onSubmit={handleSubmit(handleUpdateProfile)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-4 mb-8">
              <FormTextArea
                name="bio"
                label="User Bio"
                placeholder="A brief bio about yourself and how you use OliviaParty"
                appendClassName="sm:col-span-2"
              />
              <FormInput name="locale" label="Locale" placeholder="Locale" appendClassName="sm:col-span-2" />
              <FormInput name="tz" label="Timezone" placeholder="Timezone" appendClassName="sm:col-span-2" />
              <div className="pt-2">
                <FormButton type="submit" scheme="dark" appendClassName="col-span-2">
                  Save
                </FormButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </FormContainer>
    </>
  )
}

export default UserProfilePage
