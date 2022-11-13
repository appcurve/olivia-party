import { Controller, Get, Patch, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersService } from './users.service'
import type { SanitizedUser } from '../auth/types/sanitized-user.type'
import { UserProfileDto } from './dto/user-profile.dto'
import { UpdateUserProfileDto } from './dto/update-user-profile.dto'
import { validationPipeOptions } from '../../shared/validation-pipe.options'

const CONTROLLER_NAME = 'user'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe(validationPipeOptions))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getUserProfile(@AuthUser() user: SanitizedUser): Promise<UserProfileDto> {
    return this.usersService.getByEmail(user.email)
  }

  @Patch('profile')
  async updateUserProfile(@AuthUser() user: SanitizedUser, @Body() dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    return this.usersService.updateByUser(user, dto)
  }
}
