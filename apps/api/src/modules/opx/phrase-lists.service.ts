import { forwardRef, Inject, Injectable } from '@nestjs/common'

import type { PhraseListDto, Uid } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { PhraseList, Prisma } from '@prisma/client'
import { PlayerProfilesService } from './player-profiles.service'
import { CreatePhraseListApiDto, PhraseListApiDto, UpdatePhraseListApiDto } from './dto/op-apps/phrases.api-dto'

@Injectable()
export class PhraseListsService {
  // private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService,

    @Inject(forwardRef(() => PlayerProfilesService))
    private readonly playerProfilesService: PlayerProfilesService,
  ) {}

  /**
   * Transform nullable `enabledAt` field values from the database to their corresponding boolean values for DTO.
   */
  transformPrismaResult(input: Partial<PhraseList>): Record<string, unknown> {
    const { enabledAt, ...restInput } = input
    return Object.assign(restInput, { enabled: !!enabledAt })
  }

  async findAllByUser(
    user: AuthUser,
    playerUid: Uid,
    sort?: Prisma.PhraseListOrderByWithAggregationInput,
  ): Promise<PhraseListDto[]> {
    const phraseLists = await this.prisma.phraseList.findMany({
      where: {
        player: {
          ...this.prismaUtils.getUidCondition(playerUid),
          user: {
            id: user.id,
          },
        },
      },
      orderBy: sort || { name: 'asc' },
    })

    // return items
    return phraseLists.map((phraseList) => PhraseListApiDto.create(this.transformPrismaResult(phraseList)))
  }

  // to support player (potentially refactor into dedicated VideoGroupsPlayerService -> VideoPlaylistsPlayerService)
  // so that player has its own services delineated from the manager controller-focused ones
  async findByPlayerCode(nid: string, enabledOnly: boolean = true): Promise<PhraseListDto[]> {
    const phraseLists = await this.prisma.phraseList.findMany({
      where: {
        player: {
          urlCode: nid,
        },
        ...this.prismaUtils.conditionalClause(enabledOnly, { enabledAt: { not: null } }),
      },
    })

    return phraseLists.map((phraseList) => PhraseListApiDto.create(this.transformPrismaResult(phraseList)))
  }

  async getOneByUser(user: AuthUser, playerUid: Uid, uid: Uid): Promise<PhraseListDto> {
    try {
      const phraseList = await this.prisma.phraseList.findFirstOrThrow({
        where: {
          ...this.prismaUtils.getUidCondition(uid),
          player: {
            ...this.prismaUtils.getUidCondition(playerUid),
            user: {
              id: user.id,
            },
          },
        },
      })

      return PhraseListApiDto.create(this.transformPrismaResult(phraseList))
    } catch (error: unknown) {
      throw this.prismaUtils.processError(error)
    }
  }

  async createByUser(user: AuthUser, playerUid: Uid, dto: CreatePhraseListApiDto): Promise<PhraseListDto> {
    await this.playerProfilesService.verifyOwnerOrThrow(user, playerUid)

    const { phrases, enabled, ...restDto } = dto
    const phraseList = await this.prisma.phraseList.create({
      data: {
        ...restDto,
        phrases: JSON.stringify(phrases),
        enabledAt: enabled ? new Date() : null,
        player: {
          connect: this.prismaUtils.getUidCondition(playerUid),
        },
      },
    })

    return PhraseListApiDto.create(this.transformPrismaResult(phraseList))
  }

  async updateByUser(user: AuthUser, playerUid: Uid, uid: Uid, dto: UpdatePhraseListApiDto): Promise<PhraseListDto> {
    await this.playerProfilesService.verifyOwnerOrThrow(user, playerUid)

    const { phrases, enabled, ...restDto } = dto

    // if DTO `enabled` property is not explicitly defined then db `enabledAt` should not be mutated
    const enabledAt = enabled === true ? new Date() : enabled === false ? null : undefined

    const phraseList = await this.prisma.phraseList.update({
      where: this.prismaUtils.getUidCondition(uid),
      data: {
        phrases: JSON.stringify(phrases),
        enabledAt,
        ...restDto,
        player: {
          connect: this.prismaUtils.getUidCondition(playerUid),
        },
      },
    })

    return PhraseListApiDto.create(this.transformPrismaResult(phraseList))
  }

  async deleteByUser(user: AuthUser, playerUid: Uid, uid: Uid): Promise<void> {
    await this.playerProfilesService.verifyOwnerOrThrow(user, playerUid)

    await this.prisma.phraseList.delete({
      where: this.prismaUtils.getUidCondition(uid),
    })

    return
  }
}
