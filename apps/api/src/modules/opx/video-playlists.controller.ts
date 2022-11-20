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
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import type {
  CreateVideoPlaylistDto,
  SanitizedUserInternalDto,
  UpdateVideoPlaylistDto,
  VideoPlaylistDto,
} from '@firx/op-data-api'
import { DataQueryValidationPipe } from '../../shared/pipes/data-query-validation-pipe'
import { validationPipeOptions } from '../../shared/validation-pipe.options'
import { ParsedDataQueryParams } from '../../types/query-params.types'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { VideoPlaylistsService } from './video-playlists.service'

const CONTROLLER_NAME = 'opx/:player/video-groups' // @todo rename after types update

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe(validationPipeOptions))
export class VideoPlaylistsController {
  constructor(private readonly videoPlaylistsService: VideoPlaylistsService) {}

  @Get()
  async getPlaylists(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Query(new DataQueryValidationPipe<VideoPlaylistDto>({ sort: ['name'] }))
    query: ParsedDataQueryParams<VideoPlaylistDto, 'name', never>,
  ): Promise<VideoPlaylistDto[]> {
    return this.videoPlaylistsService.findAllByUserAndPlayer(user, playerUuid, query.sort)
  }

  @Get(':uuid')
  async getPlaylist(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<VideoPlaylistDto> {
    return this.videoPlaylistsService.getOneByUserAndPlayer(user, playerUuid, uuid)
  }

  @Post()
  async createPlaylist(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Body() dto: CreateVideoPlaylistDto,
  ): Promise<VideoPlaylistDto> {
    return this.videoPlaylistsService.createByUser(user, playerUuid, dto)
  }

  @Patch(':uuid')
  async updatePlaylist(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoPlaylistDto,
  ): Promise<VideoPlaylistDto> {
    return this.videoPlaylistsService.updateByUser(user, playerUuid, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlaylist(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.videoPlaylistsService.deleteByUserAndPlayer(user, playerUuid, uuid)
  }
}
