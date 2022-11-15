import React, { useState } from 'react'
import type { NextPage } from 'next'

import { PlusIcon } from '@heroicons/react/20/solid' // XMarkIcon,

import { Spinner } from '@firx/react-feedback'
import { ModalVariant, useModalContext } from '@firx/react-modals'
import {
  usePhraseListCreateQuery,
  usePhraseListDeleteQuery,
  usePhraseListMutateQuery,
  usePhraseListsQuery,
} from '../../../../api/hooks/phrases'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { PhraseListControl } from '../../../../components/features/phrases/PhraseListControl'
import { PhraseListCreateForm, PhraseListMutateForm } from '../../../../components/features/phrases/PhraseListForm'
import { IconButton } from '../../../../components/elements/inputs/IconButton'

export const PhrasesIndexPage: NextPage = () => {
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(undefined)

  const { data: phraseLists, ...phraseListsQuery } = usePhraseListsQuery()
  const { mutateAsync: createPhraseListAsync } = usePhraseListCreateQuery()
  const { mutateAsync: mutatePhraseListAsync, ...phraseListMutateQuery } = usePhraseListMutateQuery()
  const { mutateAsync: deletePhraseListAsync } = usePhraseListDeleteQuery()

  const isDataReady = phraseListsQuery.isSuccess && phraseLists

  const [showCreateModal] = useModalContext(
    {
      title: 'New Phrase List',
      variant: ModalVariant.FORM,
    },
    (closeModal) => (
      <PhraseListCreateForm
        onSubmitAsync={async (formValues): Promise<void> => {
          await createPhraseListAsync(formValues)
          return closeModal()
        }}
      />
    ),
  )

  const [showMutateModal] = useModalContext(
    {
      title: 'Edit Phrase List',
      variant: ModalVariant.FORM,
    },
    (closeModal) => {
      const currentDto = !!phraseLists && currentIndex !== undefined && phraseLists[currentIndex]

      return currentDto ? (
        <PhraseListMutateForm
          dto={currentDto}
          onSubmitAsync={async (formValues): Promise<void> => {
            console.table(formValues)
            await mutatePhraseListAsync({ uuid: currentDto.uuid, ...formValues })
            return closeModal()
          }}
        />
      ) : (
        <Spinner />
      )
    },
    [currentIndex, phraseLists],
  )

  const handleEditModalDisplay =
    (index: number): React.MouseEventHandler<HTMLAnchorElement> =>
    (_event) => {
      setCurrentIndex(index)
      showMutateModal()
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
          <IconButton scheme="dark" SvgIcon={PlusIcon} onClick={showCreateModal} />
        </div>
        {isDataReady && (
          <>
            <ul className="relative fx-stack-set-parent-rounded-border-divided-children">
              {phraseLists.map((phraseList, index) => (
                <li key={phraseList.uuid}>
                  <PhraseListControl
                    phraseList={phraseList}
                    isToggleLoading={
                      phraseListMutateQuery.isLoading && phraseListMutateQuery.variables?.uuid === phraseList.uuid
                    }
                    isToggleDisabled={phraseListMutateQuery.isLoading}
                    onEditClick={handleEditModalDisplay(index)}
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
