import { IsString, IsOptional } from 'class-validator'
import { Expose } from 'class-transformer'

import type { UserProfileDto as DtoInterface } from '@firx/op-data-api'

export class UserProfileDto implements DtoInterface {
  @IsString()
  @IsOptional()
  @Expose()
  bio!: string | null

  @Expose()
  @IsString()
  locale!: string

  @Expose()
  @IsString()
  tz!: string

  constructor(partial: Partial<UserProfileDto>) {
    Object.assign(this, partial)
  }
}
