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
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import type { SanitizedUserInternalDto, VideoDto, VideoPlaylistDto } from '@firx/op-data-api'
import type { ParsedDataQueryParams } from '../../types/query-params.types'
import { DataQueryValidationPipe } from '../../shared/pipes/data-query-validation-pipe'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { VideosService } from './videos.service'
import { CreateVideoApiDto, UpdateVideoApiDto } from './dto/op-apps/videos.api-dto'

const CONTROLLER_NAME = 'opx/:player/videos'

// @deprecated by zod: @UsePipes(new ValidationPipe(validationPipeOptions))

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getVideos(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Query(new DataQueryValidationPipe<VideoPlaylistDto>({ sort: ['name'] }))
    query: ParsedDataQueryParams<VideoPlaylistDto, 'name', never>,
  ): Promise<VideoDto[]> {
    return this.videosService.findAllByUserAndPlayer(user, playerUuid, query.sort)
  }

  @Get(':uuid')
  async getVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<VideoDto> {
    return this.videosService.getOneByUserAndBoxProfile(user, playerUuid, uuid)
  }

  @Post()
  async createVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Body() dto: CreateVideoApiDto,
  ): Promise<VideoDto> {
    return this.videosService.createByUser(user, playerUuid, dto)
  }

  @Patch(':uuid')
  async updateVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoApiDto,
  ): Promise<VideoDto> {
    return this.videosService.updateByUser(user, playerUuid, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.videosService.deleteByUserAndPlayer(user, playerUuid, uuid)
  }
}
