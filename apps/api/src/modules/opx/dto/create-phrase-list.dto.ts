import { Type } from 'class-transformer'
import type { PhraseList } from '@prisma/client'

import type { CreatePhraseListDto as Dto } from '@firx/op-data-api'
import { IsBoolean, IsJSON, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { PhraseDto } from './phrase.dto'

/**
 * Request DTO for the creation of a new `PhraseList` implemented as a class.
 */
export class CreatePhraseListDto implements Dto {
  @IsString()
  @IsNotEmpty()
  name!: PhraseList['name']

  @IsJSON()
  @ValidateNested({ each: true })
  @Type(() => PhraseDto)
  phrases!: PhraseDto[]

  @IsBoolean()
  @IsOptional()
  enabled?: boolean
}
