import { PhraseDto as Dto } from '@firx/op-data-api'
import { IsString } from 'class-validator'

export class PhraseDto implements Dto<'v1'> {
  @IsString()
  phrase!: Dto<'v1'>['phrase']

  @IsString()
  label!: Dto<'v1'>['label']

  @IsString()
  emoji!: Dto<'v1'>['emoji']
}
