import { forwardRef, Inject, Injectable } from '@nestjs/common'

import type { Uid } from '@firx/op-data-api'
import type { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { Prisma } from '@prisma/client'
import { CreatePhraseListDto } from './dto/create-phrase-list.dto'
import { UpdatePhraseListDto } from './dto/update-phrase-list.dto'
import { PhraseListDto } from './dto/phrase-list.dto'
import { BoxService } from './box.service'

@Injectable()
export class PhraseListsService {
  // private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService,

    @Inject(forwardRef(() => BoxService))
    private readonly boxService: BoxService,
  ) {}

  async findAllByUser(
    user: AuthUser,
    playerUid: Uid,
    sort?: Prisma.PhraseListOrderByWithAggregationInput,
  ): Promise<PhraseListDto[]> {
    const items = await this.prisma.phraseList.findMany({
      where: {
        boxProfile: {
          ...this.prismaUtils.getUidWhereCondition(playerUid),
          user: {
            id: user.id,
          },
        },
      },
      orderBy: sort || { name: 'asc' },
    })

    // return items
    return items.map((item) => new PhraseListDto(item))
  }

  async getOneByUser(user: AuthUser, playerUid: Uid, uid: Uid): Promise<PhraseListDto> {
    try {
      const item = await this.prisma.phraseList.findFirstOrThrow({
        where: {
          ...this.prismaUtils.getUidWhereCondition(uid),
          boxProfile: {
            ...this.prismaUtils.getUidWhereCondition(playerUid),
            user: {
              id: user.id,
            },
          },
        },
      })

      return new PhraseListDto(item)
    } catch (error: unknown) {
      throw this.prismaUtils.processError(error)
    }
  }

  async createByUser(user: AuthUser, playerUid: Uid, dto: CreatePhraseListDto): Promise<PhraseListDto> {
    await this.boxService.verifyOwnerOrThrow(user, playerUid)

    const { phrases, enabled, ...restDto } = dto
    const phraseList = await this.prisma.phraseList.create({
      data: {
        ...restDto,
        phrases: JSON.stringify(phrases),
        enabledAt: enabled ? new Date() : undefined,
        boxProfile: {
          connect: this.prismaUtils.getUidWhereCondition(playerUid),
        },
      },
    })

    return new PhraseListDto(phraseList)
  }

  async updateByUser(user: AuthUser, playerUid: Uid, uid: Uid, dto: UpdatePhraseListDto): Promise<PhraseListDto> {
    await this.boxService.verifyOwnerOrThrow(user, playerUid)

    const { phrases, enabled, ...restDto } = dto

    const phraseList = await this.prisma.phraseList.update({
      where: this.prismaUtils.getUidWhereCondition(uid),
      data: {
        phrases: JSON.stringify(phrases),
        enabledAt: enabled ? new Date() : undefined,
        ...restDto,
        boxProfile: {
          connect: this.prismaUtils.getUidWhereCondition(playerUid),
        },
      },
    })

    return new PhraseListDto(phraseList)
  }

  async deleteByUser(user: AuthUser, playerUid: Uid, uid: Uid): Promise<void> {
    await this.boxService.verifyOwnerOrThrow(user, playerUid)

    await this.prisma.phraseList.delete({
      where: this.prismaUtils.getUidWhereCondition(uid),
    })

    return
  }
}
