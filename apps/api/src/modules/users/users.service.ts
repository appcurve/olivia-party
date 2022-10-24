import { Injectable, NotFoundException } from '@nestjs/common'
import { AuthUser } from '../auth/types/auth-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserProfileDto } from './dto/update-user-profile.dto'
import { UserProfileDto } from './dto/user-profile.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getByEmail(email: string): Promise<UserProfileDto> {
    const result = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        profile: {
          select: {
            bio: true,
            tz: true,
            locale: true,
          },
        },
      },
    })

    if (result?.profile) {
      return new UserProfileDto(result?.profile)
    }

    throw new NotFoundException()
  }

  async updateByUser(user: AuthUser, dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    const userProfile = await this.prisma.userProfile.update({
      data: dto,
      select: {
        bio: true,
        tz: true,
        locale: true,
      },
      where: {
        userId: user.id,
      },
    })

    return new UserProfileDto(userProfile)
  }
}
