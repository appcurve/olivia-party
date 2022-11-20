import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'

import { zCreatePhraseListDto, zPhraseListDto, zPhrase_v1, zUpdatePhraseListDto } from '@firx/op-data-api'

export const zPhraseApiDto = extendApi(zPhrase_v1, {
  title: 'OP-App - Speech/Phrase - Phrase (v1)',
  description:
    'Individual phrase (schema version v1) that can be spoken using text-to-speech via the Speech (Phrase) OP-App.',
})
export class PhraseApiDto extends createZodDto(zPhraseApiDto) {}

export const zPhraseListApiDto = extendApi(zPhraseListDto, {
  title: 'OP-App - Speech/Phrase - Phrase List',
  description: 'List of phrases that can be spoken using text-to-speech via the Speech (Phrase) OP-App',
})
export class PhraseListApiDto extends createZodDto(zPhraseListApiDto) {}

export const zCreatePhraseListApiDto = extendApi(zCreatePhraseListDto, {
  title: 'OP-App - Speech/Phrase - Add/Create Phrase List',
  description: '',
})
export class CreatePhraseListApiDto extends createZodDto(zCreatePhraseListApiDto) {}

export const zUpdatePhraseListApiDto = extendApi(zUpdatePhraseListDto, {
  title: 'OP-App - Speech/Phrase - Update Phrase List',
  description: '',
})
export class UpdatePhraseListApiDto extends createZodDto(zUpdatePhraseListApiDto) {}
