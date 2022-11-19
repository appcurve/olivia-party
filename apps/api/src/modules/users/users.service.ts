import type { UserProfileDto } from '@firx/op-data-api'
import { Injectable, NotFoundException } from '@nestjs/common'

import { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserProfileApiDto } from './dto/update-user-profile.api-dto'
import { UserProfileApiDto } from './dto/user-profile.api-dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfileByEmail(email: string): Promise<UserProfileDto> {
    const result = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        profile: true,
        // profile: {
        //   select: {
        //     bio: true,
        //     timeZone: true,
        //     locale: true,
        //   },
        // },
      },
    })

    if (result?.profile) {
      return UserProfileApiDto.create(result?.profile)
    }

    throw new NotFoundException()
  }

  async updateUserProfile(user: AuthUser, dto: UpdateUserProfileApiDto): Promise<UserProfileDto> {
    const userProfile = await this.prisma.userProfile.update({
      data: dto,
      select: {
        bio: true,
        timeZone: true,
        locale: true,
      },
      where: {
        userId: user.id,
      },
    })

    return UserProfileApiDto.create(userProfile)
  }
}
