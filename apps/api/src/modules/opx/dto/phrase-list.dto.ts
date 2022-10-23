import { Expose } from 'class-transformer'
import type { PhraseList } from '@prisma/client'

import type { PhraseListDto as Dto } from '@firx/op-data-api'

/**
 * Response DTO for `PhraseList` model implemented as a DTO class to leverage NestJS' `ClassSerializerInterceptor`.
 *
 * The constructor accepts the result of a prisma query that includes fields of a PhraseList.
 */
export class PhraseListDto implements Omit<Dto, 'enabledAt'> {
  @Expose()
  uuid!: PhraseList['uuid']

  @Expose()
  createdAt!: PhraseList['createdAt']

  @Expose()
  updatedAt!: PhraseList['updatedAt']

  @Expose()
  enabled!: boolean

  @Expose()
  name!: PhraseList['name']

  @Expose()
  schemaVersion!: PhraseList['schemaVersion']

  @Expose()
  phrases!: PhraseList['phrases']

  constructor(obj: PhraseList) {
    const { enabledAt, ...restDto } = obj
    Object.assign(this, restDto, { enabled: !!enabledAt })
  }
}
