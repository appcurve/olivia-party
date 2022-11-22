import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { Prisma, Video, VideoPlaylist } from '@prisma/client'

import { CreateVideoPlaylistDto, Uid, UpdateVideoPlaylistDto, VideoPlaylistDto } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { PlayerProfilesService } from './player-profiles.service'
import { VideosService } from './videos.service'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { VideoPlaylistListApiDto } from './dto/op-apps/videos.api-dto'

@Injectable()
export class VideoPlaylistsService {
  private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService,

    @Inject(forwardRef(() => VideosService))
    private videosService: VideosService,

    @Inject(forwardRef(() => PlayerProfilesService))
    private readonly playerProfilesService: PlayerProfilesService,
  ) {}

  /**
   * Transform prisma's obtuse and overly-nested query result due to the many-to-many relation to something
   * more suitable for the response DTO, and:
   *
   * - map `enabledAt` nullable date field to corresponding `enabled` boolean value
   * - sort `videos` results as this is not presently supported by queries via prisma client api
   *
   * Currently sorting nested results does not appear possible with prisma select; this can only be accomplished
   * via raw sql query. This method's existence is an example of where ORM's risk costing as much or more vs.
   * what benefits they promise to deliver...
   *
   * @see {@link https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/working-with-many-to-many-relations}
   */
  public transformNestedPrismaResult(
    input: Partial<VideoPlaylist & { videos: { video: Video }[] }>,
  ): Record<string, unknown> {
    const { enabledAt, videos, ...restInput } = input

    return Object.assign(restInput, {
      enabledAt, // response DTO's should include `enabledAt` date vs. transform to `enabled` boolean
      videos: videos?.map((vg) => vg.video).sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    })
  }

  async findAllByUserAndUids(user: AuthUser, playerUid: Uid, videoGroupUids: Uid[]): Promise<VideoPlaylistDto[]> {
    if (!videoGroupUids.length) {
      return []
    }

    const videoPlaylists = await this.prisma.videoPlaylist.findMany({
      include: {
        videos: {
          include: {
            video: true,
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
        ...this.prismaUtils.getUidArrayInWhereCondition(videoGroupUids),
      },
      orderBy: {
        name: 'asc',
      },
    })

    return videoPlaylists.map((playlist) => VideoPlaylistListApiDto.create(this.transformNestedPrismaResult(playlist)))
  }

  async verifyUserAndPlayerOwnershipOrThrow(
    user: AuthUser,
    playerUid: Uid,
    videoPlaylistUuids: string[],
  ): Promise<true> {
    const playlists = await this.findAllByUserAndUids(user, playerUid, videoPlaylistUuids)

    if (playlists.length !== videoPlaylistUuids?.length) {
      throw new BadRequestException('Invalid list of video playlist identifiers')
    }

    return true
  }

  // to support player (potentially refactor into dedicated VideoGroupsPlayerService -> VideoPlaylistsPlayerService)
  // so that player has its own services delineated from the manager controller-focused ones
  async findByPlayerCode(nid: string, enabledOnly: boolean = true): Promise<VideoPlaylistDto[]> {
    const playlists = await this.prisma.videoPlaylist.findMany({
      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },
      where: {
        player: {
          urlCode: nid,
        },
        ...this.prismaUtils.conditionalClause(enabledOnly, { enabledAt: { not: null } }),
      },
    })

    return playlists.map((playlist) => VideoPlaylistListApiDto.create(this.transformNestedPrismaResult(playlist)))
  }

  async findAllByUserAndPlayer(
    user: AuthUser,
    playerUuid: string,
    sort?: Prisma.VideoPlaylistOrderByWithRelationAndSearchRelevanceInput, // VideoGroupOrderByWithRelationInput 4.4 deprecated
  ): Promise<VideoPlaylistDto[]> {
    const playlists = await this.prisma.videoPlaylist.findMany({
      include: {
        videos: {
          include: {
            video: true,
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
      orderBy: sort || { name: 'asc' },
    })

    return playlists.map((playlist) => VideoPlaylistListApiDto.create(this.transformNestedPrismaResult(playlist)))
  }

  async getOneByUserAndPlayer(user: AuthUser, playerUuid: string, identifier: Uid): Promise<VideoPlaylistDto> {
    const playlist = await this.prisma.videoPlaylist.findFirstOrThrow({
      include: {
        videos: {
          include: {
            video: true,
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
        ...this.prismaUtils.getUidCondition(identifier),
      },
    })

    return VideoPlaylistListApiDto.create(this.transformNestedPrismaResult(playlist))
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

    // @todo catch unique constraint violation for create video playlists
    const playlist = await this.prisma.videoPlaylist.create({
      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },
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

    return VideoPlaylistListApiDto.create(this.transformNestedPrismaResult(playlist))
  }

  async updateByUser(
    user: AuthUser,
    playerUid: Uid,
    videoPlaylistUid: Uid,
    dto: UpdateVideoPlaylistDto,
  ): Promise<VideoPlaylistDto> {
    const { videos: videoUuids, enabled, ...restDto } = dto

    this.logger.log(`request to update video playlist with enabled: ${enabled}`)

    // verify the user owns the videos that the new video group should be associated with
    if (videoUuids) {
      await this.videosService.verifyUserAndPlayerOwnershipOrThrow(user, playerUid, videoUuids)
    }

    // if DTO `enabled` property is not explicitly defined then db `enabledAt` should not be mutated
    const enabledAt = enabled === true ? new Date() : enabled === false ? null : undefined

    this.logger.log(`request to update video playlist... enabledAt resolves to: ${enabledAt}`)

    const playlist = await this.prisma.videoPlaylist.update({
      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },
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

    return VideoPlaylistListApiDto.create(this.transformNestedPrismaResult(playlist))
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
