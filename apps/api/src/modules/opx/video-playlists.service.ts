import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { Prisma, Video, VideoPlaylist } from '@prisma/client'

import { CreateVideoPlaylistDto, Uid, UpdateVideoPlaylistDto, VideoPlaylistDto } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { PlayerProfilesService } from './player-profiles.service'
import { VideosService } from './videos.service'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { VideoPlaylistListApiDto } from './dto/op-apps/video-playlist.api-dto'
import { VideoApiDto } from './dto/op-apps/video.api-dto'
import { videoPlaylistPrismaOrderByClause, videoPlaylistPrismaSelectClause } from './lib/prisma-queries'

@Injectable()
export class VideoPlaylistsService {
  // private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService,

    @Inject(forwardRef(() => VideosService))
    private videosService: VideosService,

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
    input: Partial<VideoPlaylist & { videos: { video: Partial<Video> }[] }>,
  ): Record<string, unknown> {
    const videos =
      input.videos?.map((vg) => VideoApiDto.create(vg.video)).sort((a, b) => a.name.localeCompare(b.name)) ?? []

    return Object.assign({}, input, { videos })
  }

  async findAllByUserAndUuids(user: AuthUser, playerUid: Uid, videoGroupUuids: string[]): Promise<VideoPlaylistDto[]> {
    const videoPlaylists = await this.prisma.videoPlaylist.findMany({
      select: videoPlaylistPrismaSelectClause,
      where: {
        player: {
          ...this.prismaUtils.getUidCondition(playerUid),
          user: {
            id: user.id,
          },
        },
        uuid: {
          in: videoGroupUuids,
        },
      },
      orderBy: videoPlaylistPrismaOrderByClause,
    })

    return videoPlaylists.map((playlist) => VideoPlaylistListApiDto.create(playlist))
  }

  async verifyUserAndPlayerOwnershipOrThrow(
    user: AuthUser,
    playerUid: Uid,
    videoPlaylistUuids: string[],
  ): Promise<true> {
    const playlists = await this.findAllByUserAndUuids(user, playerUid, videoPlaylistUuids)

    if (playlists.length !== videoPlaylistUuids?.length) {
      throw new BadRequestException('Invalid video groups')
    }

    return true
  }

  // to support player (potentially refactor into dedicated VideoGroupsPlayerService -> VideoPlaylistsPlayerService)
  // so that player has its own services delineated from the manager controller-focused ones
  async findByPlayerCode(nid: string, enabledOnly: boolean = true): Promise<VideoPlaylistDto[]> {
    const playlists = await this.prisma.videoPlaylist.findMany({
      select: videoPlaylistPrismaSelectClause,
      where: {
        player: {
          urlCode: nid,
        },
        ...this.prismaUtils.conditionalClause(enabledOnly, { enabledAt: { not: null } }),
      },
    })

    return playlists.map((playlist) => VideoPlaylistListApiDto.create(playlist))
  }

  async findAllByUserAndPlayer(
    user: AuthUser,
    playerUuid: string,
    sort?: Prisma.VideoPlaylistOrderByWithRelationAndSearchRelevanceInput, // VideoGroupOrderByWithRelationInput 4.4 deprecated
  ): Promise<VideoPlaylistDto[]> {
    const playlists = await this.prisma.videoPlaylist.findMany({
      select: videoPlaylistPrismaSelectClause,
      where: {
        player: {
          uuid: playerUuid,
          user: {
            id: user.id,
          },
        },
      },
      orderBy: sort || videoPlaylistPrismaOrderByClause,
    })

    return playlists.map((playlist) => VideoPlaylistListApiDto.create(playlist))
  }

  async getOneByUserAndPlayer(user: AuthUser, playerUuid: string, identifier: Uid): Promise<VideoPlaylistDto> {
    const whereCondition = this.prismaUtils.getUidCondition(identifier)

    const item = await this.prisma.videoPlaylist.findFirstOrThrow({
      select: videoPlaylistPrismaSelectClause,
      where: {
        player: {
          uuid: playerUuid,
          user: {
            id: user.id,
          },
        },
        ...whereCondition,
      },
    })

    return VideoPlaylistListApiDto.create(item)
  }

  async createByUser(user: AuthUser, playerUuid: string, dto: CreateVideoPlaylistDto): Promise<VideoPlaylistDto> {
    const { videos: videoUuids, enabled, ...restDto } = dto

    // verify the user owns the videos that the new video group should be associated with
    // @todo confirm if this can be more elegantly handled with prisma e.g. implicitly in one query w/ exception handling for response type
    if (videoUuids) {
      await this.videosService.verifyUserAndPlayerOwnershipOrThrow(user, playerUuid, videoUuids)
    }

    const transformedData = {
      ...(enabled ? { enabledAt: new Date().toISOString() } : {}),
      ...restDto,
    }

    // @todo catch unique constraint violation for video groups create
    const playlist = await this.prisma.videoPlaylist.create({
      select: videoPlaylistPrismaSelectClause,
      data: {
        ...transformedData,
        player: {
          connect: {
            uuid: playerUuid,
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

    return VideoPlaylistListApiDto.create(playlist)
  }

  async updateByUser(
    user: AuthUser,
    playerUid: Uid,
    videoPlaylistUid: Uid,
    dto: UpdateVideoPlaylistDto,
  ): Promise<VideoPlaylistDto> {
    const { videos: videoUuids, enabled, ...restDto } = dto

    // verify the user owns the videos that the new video group should be associated with
    if (videoUuids) {
      await this.videosService.verifyUserAndPlayerOwnershipOrThrow(user, playerUid, videoUuids)
    }

    // if DTO `enabled` property is not explicitly defined then db `enabledAt` should not be mutated
    const enabledAt = enabled === true ? new Date() : enabled === false ? null : undefined

    const playlist = await this.prisma.videoPlaylist.update({
      select: videoPlaylistPrismaSelectClause,
      where: this.prismaUtils.getUidCondition(videoPlaylistUid),
      data: {
        enabledAt,
        ...restDto,
        player: {
          connect: this.prismaUtils.getUidCondition(playerUid),
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

    return VideoPlaylistListApiDto.create(playlist)
  }

  async delete(videoPlaylistId: number): Promise<void> {
    const deleteVideoGroupVideosPromise = this.prisma.videoPlaylistsOnVideos.deleteMany({
      where: {
        videoPlaylistId,
      },
    })

    const deleteVideoGroupPromise = this.prisma.videoPlaylist.delete({
      where: {
        id: videoPlaylistId,
      },
    })

    await this.prisma.$transaction([deleteVideoGroupVideosPromise, deleteVideoGroupPromise])
  }

  async deleteByUserAndPlayer(user: AuthUser, playerUuid: Uid, identifier: Uid): Promise<void> {
    await this.playerProfilesService.verifyOwnerOrThrow(user, playerUuid)

    await this.prisma.videoPlaylist.delete({
      where: this.prismaUtils.getUidCondition(identifier),
    })
  }
}
