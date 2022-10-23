import React from 'react'
import type { NextPage } from 'next'

import { usePhraseListMutateQuery, usePhraseListsQuery } from '../../../../api/hooks/phrases'
import { PageHeading } from '../../../../components/elements/headings/PageHeading'
import { Spinner } from '@firx/react-feedback'
import { PhraseListController } from '../../../../components/features/phrases/PhraseListController'

export const PhrasesIndexPage: NextPage = () => {
  const { data: phraseLists, ...phraseListsQuery } = usePhraseListsQuery()
  const { mutateAsync: mutatePhraseListAsync, ...phraseListMutateQuery } = usePhraseListMutateQuery()

  const isDataReady = phraseListsQuery.isSuccess && phraseLists

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
        {isDataReady && (
          <>
            <ul className="relative fx-stack-set-parent-rounded-border-divided-children">
              {phraseLists.map((phraseList) => (
                <li key={phraseList.uuid}>
                  <PhraseListController phraseList={phraseList} onEnabledChange={handlePhraseListEnabledChange} />
                  {phraseListMutateQuery.isLoading && <Spinner />}
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
