import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersService } from './users.service'
import { UpdateUserProfileApiDto } from './dto/update-user-profile.api-dto'
import type { SanitizedUserInternalDto, UserProfileDto } from '@firx/op-data-api'

const CONTROLLER_NAME = 'user'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getUserProfile(@AuthUser() user: SanitizedUserInternalDto): Promise<UserProfileDto> {
    return this.usersService.getUserProfileByEmail(user.email)
  }

  @Patch('profile')
  async updateUserProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Body() dto: UpdateUserProfileApiDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateUserProfile(user, dto)
  }
}
