import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'
import { PhraseDto as Dto } from '@firx/op-data-api'

/**
 * Response DTO for the JSON `phrases` field of the `PhraseList` db model and the corresponding
 * shared `PhraseDto` interface; implemented as a class to leverage NestJS' `ClassSerializerInterceptor`.
 */
export class PhraseDto implements Dto<'v1'> {
  @IsString()
  @Expose()
  phrase!: Dto<'v1'>['phrase']

  @IsString()
  @Expose()
  label!: Dto<'v1'>['label']

  @IsString()
  @Expose()
  emoji!: Dto<'v1'>['emoji']
}
