import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { Prisma, Video, VideoPlaylist } from '@prisma/client'

import type { Uid, VideoDto } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { videoDtoPrismaOrderByClause, videoDtoPrismaSelectClause } from './lib/prisma-queries'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { VideoPlaylistsService } from './video-playlists.service'
import { PlayerProfilesService } from './player-profiles.service'
import { CreateVideoApiDto, UpdateVideoApiDto, VideoApiDto } from './dto/op-apps/video.api-dto'
import { VideoPlaylistListApiDto } from './dto/op-apps/video-playlist.api-dto'

@Injectable()
export class VideosService {
  private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService,

    @Inject(forwardRef(() => VideoPlaylistsService))
    private readonly videoPlaylistsService: VideoPlaylistsService,

    @Inject(forwardRef(() => PlayerProfilesService))
    private readonly playerProfilesService: PlayerProfilesService,
  ) {}

  /**
   * Transform prisma's obtuse and overly-nested query result (due to the many-to-many relation) to something
   * more suitable for the response DTO.
   *
   * This method sorts video results because at present it doesn't appear possible to sort nested results with
   * prisma's select, and that this can only be accomplished via raw sql query.
   *
   * This is an example of where ORM's risk costing as much or more vs. what benefits they promise to deliver...
   */
  public transformNestedPrismaResult(
    input: Partial<Video & { playlists: { videoPlaylist: Partial<VideoPlaylist> }[] }>,
  ): Record<string, unknown> {
    const videos =
      input.playlists
        ?.map((vp) => VideoPlaylistListApiDto.create(vp.videoPlaylist))
        .sort((a, b) => a.name.localeCompare(b.name)) ?? []

    return Object.assign({}, input, { videos })
  }

  async findAllByUserAndUuids(user: AuthUser, playerUid: Uid, videoUids: Uid[]): Promise<VideoDto[]> {
    if (videoUids.length) {
      return []
    }

    const videos = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
      where: {
        player: {
          ...this.prismaUtils.getUidCondition(playerUid),
          user: {
            id: user.id,
          },
        },
        // uuid: {
        //   in: videoUuids,
        // },
        ...this.prismaUtils.getUidArrayInWhereCondition(videoUids),
      },
      orderBy: videoDtoPrismaOrderByClause,
    })

    return videos.map((video) => VideoApiDto.create(video))
  }

  async verifyUserAndPlayerOwnershipOrThrow(user: AuthUser, playerUid: Uid, videoUuids: string[]): Promise<true> {
    const videos = await this.findAllByUserAndUuids(user, playerUid, videoUuids)

    if (videos.length !== videoUuids?.length) {
      throw new BadRequestException('Invalid videos')
    }

    return true
  }

  async findAllByUserAndPlayer(
    user: AuthUser,
    playerUuid: string,
    sort?: Prisma.VideoOrderByWithAggregationInput, // VideoOrderByWithRelationInput
  ): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      select: videoDtoPrismaSelectClause,
      where: {
        player: {
          uuid: playerUuid,
          user: {
            id: user.id,
          },
        },
      },
      orderBy: sort || videoDtoPrismaOrderByClause,
    })

    return videos.map((video) => VideoApiDto.create(video))
  }

  async getOneByUserAndBoxProfile(user: AuthUser, boxProfileUuid: string, identifier: Uid): Promise<VideoDto> {
    const whereCondition = this.prismaUtils.getUidWhereCondition(identifier)

    try {
      const video = await this.prisma.video.findFirstOrThrow({
        select: videoDtoPrismaSelectClause,
        where: {
          player: {
            uuid: boxProfileUuid,
            user: {
              id: user.id,
            },
          },
          ...whereCondition,
        },
      })

      return VideoApiDto.create(video)
    } catch (error: unknown) {
      throw this.prismaUtils.processError(error)
    }
  }

  async createByUser(user: AuthUser, boxProfileUuid: string, dto: CreateVideoApiDto): Promise<VideoDto> {
    const { playlists: playlistUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (playlistUuids) {
      await this.videoPlaylistsService.verifyUserAndPlayerOwnershipOrThrow(user, boxProfileUuid, playlistUuids)
    }

    // @todo catch unique constraint violation for videos create
    const video = await this.prisma.video.create({
      select: videoDtoPrismaSelectClause,
      data: {
        ...restDto,
        player: {
          connect: {
            uuid: boxProfileUuid,
          },
        },
        playlists: {
          create: playlistUuids?.map((uuid) => ({
            videoPlaylist: {
              connect: this.prismaUtils.getUidCondition(uuid),
            },
          })),
        },
      },
    })

    return VideoApiDto.create(video)
  }

  async updateByUser(user: AuthUser, playerUid: Uid, videoUid: Uid, dto: UpdateVideoApiDto): Promise<VideoDto> {
    const { playlists: videoPlaylistUuids, ...restDto } = dto

    // verify the user owns the video groups that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoPlaylistUuids) {
      await this.videoPlaylistsService.verifyUserAndPlayerOwnershipOrThrow(user, playerUid, videoPlaylistUuids)
    }

    const video = await this.prisma.video.update({
      select: videoDtoPrismaSelectClause,
      where: this.prismaUtils.getUidCondition(videoUid),
      data: {
        ...restDto,
        player: {
          connect: this.prismaUtils.getUidCondition(playerUid),
        },
        ...(videoPlaylistUuids
          ? {
              groups: {
                deleteMany: {},
                create: videoPlaylistUuids?.map((uuid) => ({
                  videoPlaylist: {
                    connect: this.prismaUtils.getUidCondition(uuid),
                  },
                })),
              },
            }
          : {}),
      },
    })

    return VideoApiDto.create(video)
  }

  async deleteByUserAndPlayer(user: AuthUser, playerUid: string, videoUid: Uid): Promise<void> {
    await this.playerProfilesService.verifyOwnerOrThrow(user, playerUid)

    await this.prisma.video.delete({
      where: this.prismaUtils.getUidCondition(videoUid),
    })
  }
}
