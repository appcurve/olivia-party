import { IsString, IsOptional } from 'class-validator'
import type { UserProfileDto as DtoInterface } from '@firx/op-data-api'

export class UpdateUserProfileDto implements DtoInterface {
  @IsString()
  @IsOptional()
  bio!: string | null

  @IsString()
  locale!: string

  @IsString()
  tz!: string

  constructor(partial: Partial<UpdateUserProfileDto>) {
    Object.assign(this, partial)
  }
}
