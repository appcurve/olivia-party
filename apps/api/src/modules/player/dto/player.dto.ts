// import { Expose } from 'class-transformer'

// import type { PlayerDto as Dto, BoxProfileDto } from '@firx/op-data-api'

// /**
//  * Response DTO for `PlayerDto` database model as a class to leverage NestJS' `ClassSerializerInterceptor`.
//  *
//  * The `apps` prop is set by a constructor and is not a class DTO so note that `ClassSerializerInterceptor` will
//  * have no effect on serialization of the`apps` property.
//  */
// export class PlayerDto implements Dto {
//   @Expose()
//   name!: BoxProfileDto['name']

//   // @Transform(({ value }) => {
//   //   return JSON.stringify(value ?? '[]')
//   // })

//   @Expose()
//   apps!: Dto['apps']

//   constructor(obj: PlayerDto) {
//     const { name, apps, ...restDto } = obj
//     Object.assign(this, { name, apps }, restDto)
//   }
// }
