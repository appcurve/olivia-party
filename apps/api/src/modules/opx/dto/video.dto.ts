export {}

// import { Expose, Type } from 'class-transformer'
// import type { Video, VideoGroup } from '@prisma/client'
// import { VideoPlatform } from '../constants/video-platform.enum'
// import { VideoGroupDto } from './video-group.dto'
// import { InternalServerErrorException } from '@nestjs/common'
// import type { VideoResponse } from '../types/response.types'
// import { VIDEO_MODEL_NULLABLE_FIELDS, VIDEO_MODEL_PUBLIC_FIELDS } from '../constants/video-model-public-fields.const'

// /**
//  * Response DTO for Video model, compatible with NestJS' `ClassSerializerInterceptor`.
//  *
//  * The constructor accepts the result of a prisma query that includes nested VideoGroup's,
//  * validates that required fields are set (or else throws an error to safeguard
//  * against regressions that omit required response data), and maps the data to this DTO.
//  */
// export class VideoDto implements VideoResponse {
//   @Expose()
//   uuid!: string

//   @Expose()
//   createdAt!: Date

//   @Expose()
//   updatedAt!: Date

//   @Expose()
//   name!: string

//   @Expose()
//   platform!: VideoPlatform

//   @Expose()
//   externalId!: string

//   @Expose()
//   @Type(() => VideoGroupDto)
//   groups!: VideoGroupDto[]

// constructor(partial: Partial<Video & { groups: { videoGroup: Partial<VideoGroup> }[] }>) {
//   // console.log('creating partial video.dto.ts', JSON.stringify(partial, null, 2))
//   const videoFields = VIDEO_MODEL_PUBLIC_FIELDS.reduce((acc, fieldName) => {
//     if (
//       !VIDEO_MODEL_NULLABLE_FIELDS.includes(fieldName) &&
//       (partial[fieldName] === undefined || partial[fieldName] === null)
//     ) {
//       throw new InternalServerErrorException(
//         `Invalid query result: missing expected data for required field '${fieldName}' (value: ${String(
//           partial[fieldName],
//         )})`,
//       )
//     }

//     return {
//       ...acc,
//       [fieldName]: partial[fieldName],
//     }
//   }, {} as Partial<Video>)

//   // map prisma's overly-nested query result (due to many-to-many) to response DTO
//   // the sort is because it doesn't appear currently possible to sort nested results w/ select (only via raw sql query)
//   const groupsField =
//     partial.groups?.map((vg) => new VideoGroupDto(vg.videoGroup)).sort((a, b) => a.name.localeCompare(b.name)) ?? []

//   Object.assign(this, videoFields, {
//     groups: groupsField,
//   })
// }
// }
