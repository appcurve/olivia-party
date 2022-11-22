import { Injectable, UnauthorizedException } from '@nestjs/common'
import { nanoid } from 'nanoid/async'

import type { AuthUser } from '../auth/types/auth-user.type'
import type { PlayerDto } from '@firx/op-data-api'

import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePlayerApiDto, PlayerApiDto, UpdatePlayerApiDto } from './dto/player.api-dto'

/*
 * note: running with nanoid version 3.0 (nanoid@^3.0.0) until nx adds more elegant built-in support for esm
 *       @see https://github.com/nrwl/nx/pull/10414
 *       @future upgrade nanoid when nx can handle it elegantly without a bunch of makework
 */

@Injectable()
export class PlayerProfilesService {
  // private logger = new Logger(this.constructor.name)

  constructor(private readonly prisma: PrismaService, private readonly prismaUtils: PrismaUtilsService) {}

  // deprecated with zod approach (zod's default behavior is to strip all fields not part of the schema)
  // private getPlayerDtoSelectClause(): Record<string, true> {
  //   return this.BOX_PROFILE_PUBLIC_FIELDS.reduce((acc, fieldName) => ({ ...acc, [fieldName]: true }), {})
  // }

  async findAllByUser(user: AuthUser): Promise<PlayerDto[]> {
    const players = await this.prisma.player.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return players.map((player) => PlayerApiDto.create(player))
  }

  /**
   * Verify the given `user` owns the player identified by the given uuid or id.
   */
  async verifyOwnerOrThrow(user: AuthUser, uid: string | number): Promise<true> {
    try {
      const player = await this.prisma.player.findFirstOrThrow({
        where: {
          user: {
            id: user.id,
          },
          ...this.prismaUtils.getUidCondition(uid),
        },
      })

      if (!player) {
        return Promise.reject(new UnauthorizedException())
      }

      return true
    } catch (error: unknown) {
      if (this.prismaUtils.isNotFoundError(error)) {
        throw new UnauthorizedException()
      }

      throw error
    }
  }

  async getOneByUser(user: AuthUser, identifier: string | number): Promise<PlayerDto> {
    const whereCondition = this.prismaUtils.getUidCondition(identifier)

    const playerProfile = await this.prisma.player.findFirstOrThrow({
      where: {
        user: {
          id: user.id,
        },
        ...whereCondition,
      },
    })

    return PlayerApiDto.create(playerProfile)
  }

  async createByUser(user: AuthUser, dto: CreatePlayerApiDto): Promise<PlayerDto> {
    const urlCode = await nanoid(10)

    const playerProfile = await this.prisma.player.create({
      data: {
        ...dto,
        urlCode,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return PlayerApiDto.create(playerProfile)
  }

  async updateByUser(user: AuthUser, identifier: string | number, dto: UpdatePlayerApiDto): Promise<PlayerDto> {
    const playerProfile = await this.prisma.player.update({
      where: this.prismaUtils.getUidCondition(identifier),
      data: {
        ...dto,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return PlayerApiDto.create(playerProfile)
  }

  async deleteByUser(user: AuthUser, identifier: string | number): Promise<void> {
    await this.getOneByUser(user, identifier) // throws on not found

    await this.prisma.player.delete({
      where: this.prismaUtils.getUidCondition(identifier),
    })
  }
}
