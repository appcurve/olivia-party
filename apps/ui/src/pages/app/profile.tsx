import type { NextPage } from 'next'

import { zUserProfile } from '@firx/op-data-api'
import { Form, FormInput, FormTextArea } from '@firx/react-forms-rhf'

import { useUserProfileMutateQuery, useUserProfileQuery } from '../../api/hooks/user'
import { PageHeading } from '../../components/elements/headings/PageHeading'
import { useAuthSession } from '../../context/SessionContextProvider'

export const UserProfilePage: NextPage = (_props) => {
  const session = useAuthSession()

  const userProfileQuery = useUserProfileQuery()
  const mutateUserProfileQuery = useUserProfileMutateQuery()

  return (
    <>
      <PageHeading>My Profile</PageHeading>
      <Form
        onSubmitForm={async (formValues): Promise<void> => {
          await mutateUserProfileQuery.mutateAsync(formValues)
        }}
        defaultValues={userProfileQuery.data}
        schema={zUserProfile}
      >
        <p className="mb-4 text-lg text-center text-P-primary">
          {session.profile.name} ({session.profile.email})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-4 mb-8">
          <FormTextArea
            name="bio"
            label="User Bio"
            placeholder="A brief bio about yourself and how you use OliviaParty"
            appendClassName="sm:col-span-2"
          />
          <FormInput name="locale" label="Locale" placeholder="Locale" appendClassName="sm:col-span-2" />
          <FormInput name="timeZone" label="Timezone" placeholder="Timezone" appendClassName="sm:col-span-2" />
        </div>
      </Form>
    </>
  )
}

export default UserProfilePage
