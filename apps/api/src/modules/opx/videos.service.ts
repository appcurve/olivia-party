import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { Prisma, Video, VideoPlaylist } from '@prisma/client'

import type { Uid, VideoDto } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { videoDtoPrismaOrderByClause } from './lib/prisma-queries'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { VideoPlaylistsService } from './video-playlists.service'
import { PlayerProfilesService } from './player-profiles.service'
import { CreateVideoApiDto, UpdateVideoApiDto, VideoApiDto } from './dto/op-apps/videos.api-dto'

@Injectable()
export class VideosService {
  // private logger = new Logger(this.constructor.name)

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
  transformNestedPrismaResult(
    input: Partial<Video & { playlists: { videoPlaylist: VideoPlaylist }[] }>,
  ): Record<string, unknown> {
    const { playlists, ...restInput } = input

    return Object.assign(restInput, {
      playlists: playlists?.map((p) => p.videoPlaylist).sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    })
  }

  async findAllByUserAndUids(user: AuthUser, playerUid: Uid, videoUids: Uid[]): Promise<VideoDto[]> {
    if (!videoUids.length) {
      return []
    }

    const videos = await this.prisma.video.findMany({
      include: {
        playlists: {
          include: {
            videoPlaylist: true,
          },
        },
      },
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

    return videos.map((video) => VideoApiDto.create(this.transformNestedPrismaResult(video)))
  }

  async verifyUserAndPlayerOwnershipOrThrow(user: AuthUser, playerUid: Uid, videoUids: Uid[]): Promise<true> {
    const videos = await this.findAllByUserAndUids(user, playerUid, videoUids)

    if (videos.length !== videoUids?.length) {
      throw new BadRequestException('Invalid list of video identifiers')
    }

    return true
  }

  async findAllByUserAndPlayer(
    user: AuthUser,
    playerUuid: string,
    sort?: Prisma.VideoOrderByWithAggregationInput,
  ): Promise<VideoDto[]> {
    const videos = await this.prisma.video.findMany({
      include: {
        playlists: {
          include: {
            videoPlaylist: true,
          },
        },
      },
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

    return videos.map((video) => VideoApiDto.create(this.transformNestedPrismaResult(video)))
  }

  async getOneByUserAndBoxProfile(user: AuthUser, boxProfileUuid: string, identifier: Uid): Promise<VideoDto> {
    try {
      const video = await this.prisma.video.findFirstOrThrow({
        include: {
          playlists: {
            include: {
              videoPlaylist: true,
            },
          },
        },
        where: {
          player: {
            uuid: boxProfileUuid,
            user: {
              id: user.id,
            },
          },
          ...this.prismaUtils.getUidCondition(identifier),
        },
      })

      return VideoApiDto.create(this.transformNestedPrismaResult(video))
    } catch (error: unknown) {
      throw this.prismaUtils.processError(error)
    }
  }

  async createByUser(user: AuthUser, boxProfileUuid: string, dto: CreateVideoApiDto): Promise<VideoDto> {
    const { playlists: playlistUuids, ...restDto } = dto

    // verify the user owns the video playlists that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (playlistUuids) {
      await this.videoPlaylistsService.verifyUserAndPlayerOwnershipOrThrow(user, boxProfileUuid, playlistUuids)
    }

    // @todo catch unique constraint violation for videos create
    const video = await this.prisma.video.create({
      include: {
        playlists: {
          include: {
            videoPlaylist: true,
          },
        },
      },
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

    return VideoApiDto.create(this.transformNestedPrismaResult(video))
  }

  async updateByUser(user: AuthUser, playerUid: Uid, videoUid: Uid, dto: UpdateVideoApiDto): Promise<VideoDto> {
    const { playlists: videoPlaylistUuids, ...restDto } = dto

    // verify the user owns the video playlists that the new video should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoPlaylistUuids) {
      await this.videoPlaylistsService.verifyUserAndPlayerOwnershipOrThrow(user, playerUid, videoPlaylistUuids)
    }

    const video = await this.prisma.video.update({
      include: {
        playlists: {
          include: {
            videoPlaylist: true,
          },
        },
      },
      where: this.prismaUtils.getUidCondition(videoUid),
      data: {
        ...restDto,
        player: {
          connect: this.prismaUtils.getUidCondition(playerUid),
        },
        ...(videoPlaylistUuids
          ? {
              playlists: {
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

    return VideoApiDto.create(this.transformNestedPrismaResult(video))
  }

  async deleteByUserAndPlayer(user: AuthUser, playerUid: string, videoUid: Uid): Promise<void> {
    await this.playerProfilesService.verifyOwnerOrThrow(user, playerUid)

    await this.prisma.video.delete({
      where: this.prismaUtils.getUidCondition(videoUid),
    })
  }
}
