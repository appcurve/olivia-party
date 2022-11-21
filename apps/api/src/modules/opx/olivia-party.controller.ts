import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import type { PlayerDto, SanitizedUserInternalDto } from '@firx/op-data-api'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PlayerProfilesService } from './player-profiles.service'
import { CreatePlayerApiDto, UpdatePlayerApiDto } from './dto/player.api-dto'

const CONTROLLER_NAME = 'opx'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class OliviaPartyController {
  constructor(private readonly playerProfilesService: PlayerProfilesService) {}

  @Get()
  async getPlayerProfiles(@AuthUser() user: SanitizedUserInternalDto): Promise<PlayerDto[]> {
    return this.playerProfilesService.findAllByUser(user)
  }

  @Get(':uuid')
  async getPlayerProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<PlayerDto> {
    return this.playerProfilesService.getOneByUser(user, uuid)
  }

  @Post()
  async createPlaryerProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Body() dto: CreatePlayerApiDto,
  ): Promise<PlayerDto> {
    return this.playerProfilesService.createByUser(user, dto)
  }

  @Patch(':uuid')
  async updateBoxProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdatePlayerApiDto,
  ): Promise<PlayerDto> {
    return this.playerProfilesService.updateByUser(user, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.playerProfilesService.deleteByUser(user, uuid)
  }
}
