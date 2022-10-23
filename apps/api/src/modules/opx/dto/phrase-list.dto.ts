import { Expose } from 'class-transformer'
import type { PhraseList } from '@prisma/client'
import { InternalServerErrorException } from '@nestjs/common'

import type { PhraseListDto as Dto } from '@firx/op-data-api'

/**
 * Response DTO for `PhraseList` model implemented as a DTO class to leverage NestJS' `ClassSerializerInterceptor`.
 *
 * The constructor accepts the result of a prisma query that includes fields of a PhraseList.
 */
export class PhraseListDto implements Dto {
  @Expose()
  uuid!: PhraseList['uuid']

  @Expose()
  createdAt!: PhraseList['createdAt']

  @Expose()
  updatedAt!: PhraseList['updatedAt']

  @Expose()
  enabledAt!: PhraseList['enabledAt']

  @Expose()
  name!: PhraseList['name']

  @Expose()
  schemaVersion!: PhraseList['schemaVersion']

  @Expose()
  phrases!: PhraseList['phrases']

  constructor(partial: Partial<PhraseListDto>) {
    Object.assign(this, partial)
  }
}
