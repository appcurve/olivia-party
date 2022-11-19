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

import type { SanitizedUserInternalDto } from '@firx/op-data-api'
import type { ParsedDataQueryParams } from '../../types/query-params.types'
import { DataQueryValidationPipe } from '../../shared/pipes/data-query-validation-pipe'
import { validationPipeOptions } from '../../shared/validation-pipe.options'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateVideoDto } from './dto/create-video.dto'
import { UpdateVideoDto } from './dto/update-video.dto'
import { VideoGroupDto } from './dto/video-group.dto'
import { VideoDto } from './dto/video.dto'
import { VideosService } from './videos.service'

const CONTROLLER_NAME = 'opx/:boxProfileUuid/videos'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe(validationPipeOptions))
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getVideos(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Query(new DataQueryValidationPipe<VideoGroupDto>({ sort: ['name'] }))
    query: ParsedDataQueryParams<VideoGroupDto, 'name', never>,
  ): Promise<VideoDto[]> {
    return this.videosService.findAllByUserAndBoxProfile(user, boxProfileUuid, query.sort)
  }

  @Get(':uuid')
  async getVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<VideoDto> {
    return this.videosService.getOneByUserAndBoxProfile(user, boxProfileUuid, uuid)
  }

  @Post()
  async createVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Body() dto: CreateVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.createByUser(user, boxProfileUuid, dto)
  }

  @Patch(':uuid')
  async updateVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoDto,
  ): Promise<VideoDto> {
    return this.videosService.updateByUser(user, boxProfileUuid, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.videosService.deleteByUserAndBoxProfile(user, boxProfileUuid, uuid)
  }
}
