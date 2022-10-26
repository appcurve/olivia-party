import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import type { Uid } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { BoxService } from './box.service'
import { CreateVideoGroupDto } from './dto/create-video-group.dto'
import { UpdateVideoGroupDto } from './dto/update-video-group.dto'
import { VideoGroupDto } from './dto/video-group.dto'
import { videoGroupDtoPrismaOrderByClause, videoGroupDtoPrismaSelectClause } from './lib/prisma-queries'
import { VideosService } from './videos.service'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'

@Injectable()
export class VideoGroupsService {
  private logger = new Logger(this.constructor.name)

  // private ERROR_MESSAGES = {
  //   INTERNAL_SERVER_ERROR: 'Server Error',
  // }

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService,

    @Inject(forwardRef(() => VideosService))
    private videosService: VideosService,

    @Inject(forwardRef(() => BoxService))
    private readonly boxService: BoxService,
  ) {}

  private getIdentifierWhereCondition(identifier: Uid): { uuid: string } | { id: number } {
    switch (typeof identifier) {
      case 'string': {
        return { uuid: identifier }
      }
      case 'number': {
        return { id: identifier }
      }
      default: {
        this.logger.error(`Unexpected invalid data identifier at runtime: ${identifier}`)
        throw new InternalServerErrorException('Server Error')
      }
    }
  }

  async findAllByUserAndUuids(
    user: AuthUser,
    boxProfileUuid: string,
    videoGroupUuids: string[],
  ): Promise<VideoGroupDto[]> {
    const videoGroups = await this.prisma.videoGroup.findMany({
      select: videoGroupDtoPrismaSelectClause,
      where: {
        boxProfile: {
          uuid: boxProfileUuid,
          user: {
            id: user.id,
          },
        },
        uuid: {
          in: videoGroupUuids,
        },
      },
      orderBy: videoGroupDtoPrismaOrderByClause,
    })

    return videoGroups.map((videoGroup) => new VideoGroupDto(videoGroup))
  }

  async verifyUserAndBoxProfileOwnershipOrThrow(
    user: AuthUser,
    boxProfileUuid: string,
    videoGroupUuids: string[],
  ): Promise<true> {
    const videoGroups = await this.findAllByUserAndUuids(user, boxProfileUuid, videoGroupUuids)

    if (videoGroups.length !== videoGroupUuids?.length) {
      throw new BadRequestException('Invalid video groups')
    }

    return true
  }

  // to support player (potentially refactor into dedicated VideoGroupsPlayerService -> VideoPlaylistsPlayerService)
  // so that player has its own services delineated from the manager controller-focused ones
  async findByPlayerProfileCode(nid: string, enabledOnly: boolean = true): Promise<VideoGroupDto[]> {
    const items = await this.prisma.videoGroup.findMany({
      select: videoGroupDtoPrismaSelectClause,
      where: {
        boxProfile: {
          urlCode: nid,
        },
        ...this.prismaUtils.conditionalClause(enabledOnly, { enabledAt: { not: null } }),
      },
    })

    return items.map((item) => new VideoGroupDto(item))
  }

  async findAllByUserAndBoxProfile(
    user: AuthUser,
    boxProfileUuid: string,
    sort?: Prisma.VideoGroupOrderByWithRelationAndSearchRelevanceInput, // VideoGroupOrderByWithRelationInput 4.4 deprecated
  ): Promise<VideoGroupDto[]> {
    const items = await this.prisma.videoGroup.findMany({
      select: videoGroupDtoPrismaSelectClause,
      where: {
        boxProfile: {
          uuid: boxProfileUuid,
          user: {
            id: user.id,
          },
        },
      },
      orderBy: sort || videoGroupDtoPrismaOrderByClause,
    })

    return items.map((item) => new VideoGroupDto(item))
  }

  async getOneByUserAndBoxProfile(user: AuthUser, boxProfileUuid: string, identifier: Uid): Promise<VideoGroupDto> {
    const whereCondition = this.getIdentifierWhereCondition(identifier)

    const item = await this.prisma.videoGroup.findFirstOrThrow({
      select: videoGroupDtoPrismaSelectClause,
      where: {
        boxProfile: {
          uuid: boxProfileUuid,
          user: {
            id: user.id,
          },
        },
        ...whereCondition,
      },
    })

    return new VideoGroupDto(item)
  }

  async createByUser(user: AuthUser, boxProfileUuid: string, dto: CreateVideoGroupDto): Promise<VideoGroupDto> {
    const { videos: videoUuids, enabled, ...restDto } = dto

    // verify the user owns the videos that the new video group should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoUuids) {
      await this.videosService.verifyUserAndBoxProfileOwnershipOrThrow(user, boxProfileUuid, videoUuids)
    }

    const videoGroupData = {
      ...(enabled ? { enabledAt: new Date().toISOString() } : {}),
      ...restDto,
    }

    // @todo catch unique constraint violation for video groups create
    const videoGroup = await this.prisma.videoGroup.create({
      select: videoGroupDtoPrismaSelectClause,
      data: {
        ...videoGroupData,
        boxProfile: {
          connect: {
            uuid: boxProfileUuid,
          },
        },
        videos: {
          create: videoUuids?.map((uuid) => ({
            video: {
              connect: {
                uuid,
              },
            },
          })),
        },
      },
    })

    return new VideoGroupDto(videoGroup)
  }

  async updateByUser(
    user: AuthUser,
    boxProfileUuid: string,
    identifier: Uid,
    dto: UpdateVideoGroupDto,
  ): Promise<VideoGroupDto> {
    const videoWhereCondition = this.getIdentifierWhereCondition(identifier)
    const { videos: videoUuids, enabled, ...restDto } = dto

    // verify the user owns the videos that the new video group should be associated with
    if (videoUuids) {
      await this.videosService.verifyUserAndBoxProfileOwnershipOrThrow(user, boxProfileUuid, videoUuids)
    }

    const videoGroupData = {
      // if DTO `enabled` is undefined then db `enabledAt` should not be mutated
      // @todo test for the nullable behavior w/ prisma update + undefined
      ...(enabled === true
        ? { enabledAt: new Date().toISOString() }
        : enabled === false
        ? { enabledAt: null }
        : { enabledAt: undefined }),
      ...restDto,
    }

    const videoGroup = await this.prisma.videoGroup.update({
      select: videoGroupDtoPrismaSelectClause,
      where: videoWhereCondition,
      data: {
        ...videoGroupData,
        boxProfile: {
          connect: {
            uuid: boxProfileUuid,
          },
        },
        ...(videoUuids
          ? {
              videos: {
                deleteMany: {},
                create: videoUuids?.map((uuid) => ({
                  video: {
                    connect: {
                      uuid,
                    },
                  },
                })),
              },
            }
          : {}),
      },
    })

    return new VideoGroupDto(videoGroup)
  }

  async delete(videoGroupId: number): Promise<void> {
    const deleteVideoGroupVideos = this.prisma.videoGroupsOnVideos.deleteMany({
      where: {
        videoGroupId,
      },
    })

    const deleteVideoGroup = this.prisma.videoGroup.delete({
      where: {
        id: videoGroupId,
      },
    })

    await this.prisma.$transaction([deleteVideoGroupVideos, deleteVideoGroup])
    return
  }

  async deleteByUserAndBoxProfile(user: AuthUser, boxProfileUuid: Uid, identifier: Uid): Promise<void> {
    await this.boxService.verifyOwnerOrThrow(user, boxProfileUuid)

    const videoGroupWhereCondition = this.getIdentifierWhereCondition(identifier)

    await this.prisma.videoGroup.delete({
      where: videoGroupWhereCondition,
    })

    // const deleteVideoGroupVideos = this.prisma.videoGroupsOnVideos.deleteMany({
    //   where: {
    //     videoGroup: {
    //       ...videoGroupWhereCondition,
    //     },
    //   },
    // })

    // const deleteVideoGroup = this.prisma.videoGroup.delete({
    //   include: {
    //     boxProfile: true,
    //   },
    //   where: videoGroupWhereCondition,
    // })

    // await this.prisma.$transaction([deleteVideoGroupVideos, deleteVideoGroup])

    return
  }
}
