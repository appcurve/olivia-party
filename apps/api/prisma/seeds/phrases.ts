import type { Prisma } from '@prisma/client'
import type { PhraseDto } from '@firx/op-data-api'

const phraseLists: Record<string, PhraseDto<'v1'>[]> = {
  general: [
    {
      phrase: 'Hello',
      label: 'Greeting (hi)',
      emoji: '',
    },
    {
      phrase: 'Yes',
      label: 'Yes',
      emoji: '',
    },
    {
      phrase: 'No',
      label: 'No',
      emoji: '',
    },
  ],
  food: ['Pizza', 'Wings', 'Ice Cream', 'Lollipop'].map((item) => ({
    phrase: item,
    label: item,
    emoji: '',
  })),
}

export const phraseListsData: Omit<Prisma.PhraseListCreateInput, 'boxProfile'>[] = Object.entries(phraseLists).map(
  ([phraseListName, phrases]) => {
    return {
      name: phraseListName,
      phrases: JSON.stringify(phrases),
      schemaVersion: 'v1',
      enabledAt: phraseListName === 'general' ? new Date() : undefined,
    }
  },
)
