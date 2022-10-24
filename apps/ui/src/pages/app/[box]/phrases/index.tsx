import React from 'react'
import type { NextPage } from 'next'

import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid'

import {
  usePhraseListCreateQuery,
  usePhraseListDeleteQuery,
  usePhraseListMutateQuery,
  usePhraseListsQuery,
} from '../../../../api/hooks/phrases'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { Spinner } from '@firx/react-feedback'
import { PhraseListControl } from '../../../../components/features/phrases/PhraseListControl'
import { PhraseListForm } from '../../../../components/features/phrases/PhraseListForm'
import { CreatePhraseListDto } from '@firx/op-data-api'
import { ModalVariant, useModalContext } from '@firx/react-modals'
import { IconButton } from '../../../../components/elements/inputs/IconButton'

export const PhrasesIndexPage: NextPage = () => {
  const { data: phraseLists, ...phraseListsQuery } = usePhraseListsQuery()
  const { mutateAsync: createPhraseListAsync } = usePhraseListCreateQuery()
  const { mutateAsync: mutatePhraseListAsync, ...phraseListMutateQuery } = usePhraseListMutateQuery()
  const { mutateAsync: deletePhraseListAsync, ...phraseListDeleteQuery } = usePhraseListDeleteQuery()

  const isDataReady = phraseListsQuery.isSuccess && phraseLists

  const [showAddVideoGroupModal] = useModalContext(
    {
      title: 'New Phrase List',
      variant: ModalVariant.FORM,
    },
    () => <PhraseListForm onSubmitAsync={handleCreateAsync} />,
  )

  const handleCreateAsync = async (formValues: CreatePhraseListDto): Promise<void> => {
    console.log(JSON.stringify(formValues, null, 2))
    await createPhraseListAsync(formValues)
  }

  const handleDeleteAsync =
    (uuid: string): React.MouseEventHandler<HTMLAnchorElement> =>
    async () => {
      await deletePhraseListAsync({
        uuid,
      })
    }

  const handlePhraseListEnabledChange = async (uuid: string, enabled: boolean): Promise<void> => {
    mutatePhraseListAsync({ uuid, enabled })
  }

  return (
    <>
      <PageHeading showLoadingSpinner={phraseListsQuery.isFetching}>Manage Phrases</PageHeading>
      <div className="mb-4 sm:mb-6">
        <p className="mb-2 sm:mb-0">
          Create lists of short phrases that users can select and play aloud using text-to-speech.
        </p>
        <p>
          Switch a Phrase List to <strong>Active</strong> to load it to your Player&apos;s <strong>Speech Mode</strong>.
        </p>
      </div>
      <div>
        {phraseListsQuery.isError && <p>Error fetching data</p>}
        {phraseListsQuery.isLoading && <Spinner />}
        <div className="flex justify-end">
          <IconButton scheme="dark" SvgIcon={PlusIcon} onClick={showAddVideoGroupModal} />
        </div>
        {isDataReady && (
          <>
            <ul className="relative fx-stack-set-parent-rounded-border-divided-children">
              {phraseLists.map((phraseList) => (
                <li key={phraseList.uuid}>
                  <PhraseListControl
                    phraseList={phraseList}
                    isToggleLoading={
                      phraseListMutateQuery.isLoading && phraseListMutateQuery.variables?.uuid === phraseList.uuid
                    }
                    isToggleDisabled={phraseListMutateQuery.isLoading}
                    onEditClick={(): void => alert('edit')}
                    onDeleteClick={handleDeleteAsync(phraseList.uuid)}
                    onEnabledChange={handlePhraseListEnabledChange}
                  />
                  {/* {phraseListMutateQuery.isLoading && <Spinner />} */}
                </li>
              ))}
            </ul>
            {phraseLists.length === 0 && (
              <div className="flex items-center border-2 border-dashed rounded-md p-4">
                <div className="text-slate-600">No phrase lists found.</div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default PhrasesIndexPage
