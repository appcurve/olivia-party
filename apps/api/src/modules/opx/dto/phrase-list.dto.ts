// import { Expose, Transform, Type } from 'class-transformer'
// import type { PhraseList } from '@prisma/client'

// import type { PhraseListDto as Dto } from '@firx/op-data-api'
// import { PhraseDto } from './phrase.dto'

// /**
//  * Response DTO for `PhraseList` database model and its corresponding shared `PhraseListDto` interface,
//  * implemented as a class to leverage NestJS' `ClassSerializerInterceptor`.
//  *
//  * The constructor accepts the result of a prisma query that selects the fields of a `PhraseList`.
//  */
// export class PhraseListDto implements Omit<Dto, 'enabledAt'> {
//   @Expose()
//   uuid!: PhraseList['uuid']

//   @Expose()
//   createdAt!: PhraseList['createdAt']

//   @Expose()
//   updatedAt!: PhraseList['updatedAt']

//   @Expose()
//   enabled!: boolean

//   @Expose()
//   name!: PhraseList['name']

//   @Expose()
//   schemaVersion!: PhraseList['schemaVersion']

//   @Expose()
//   @Type(() => PhraseDto)
//   @Transform(({ value }) => {
//     return JSON.parse(value ?? '[]')
//   })
//   phrases!: PhraseDto[]

//   constructor(obj: PhraseList) {
//     const { enabledAt, ...restDto } = obj
//     Object.assign(this, restDto, { enabled: !!enabledAt })
//   }
// }
