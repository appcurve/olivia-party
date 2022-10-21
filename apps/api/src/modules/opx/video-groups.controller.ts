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
import { DataQueryValidationPipe } from '../../shared/pipes/data-query-validation-pipe'
import { ParsedDataQueryParams } from '../../types/query-params.types'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SanitizedUser } from '../auth/types/sanitized-user.type'
import { CreateVideoGroupDto } from './dto/create-video-group.dto'
import { UpdateVideoGroupDto } from './dto/update-video-group.dto'
import { VideoGroupDto } from './dto/video-group.dto'
import { VideoGroupsService } from './video-groups.service'

const CONTROLLER_NAME = 'opx/:boxProfileUuid/video-groups'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class VideoGroupsController {
  constructor(private readonly videosGroupsService: VideoGroupsService) {}

  @Get()
  async getVideoGroups(
    @AuthUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Query(new DataQueryValidationPipe<VideoGroupDto>({ sort: ['name'] }))
    query: ParsedDataQueryParams<VideoGroupDto, 'name', never>,
  ): Promise<VideoGroupDto[]> {
    return this.videosGroupsService.findAllByUserAndBoxProfile(user, boxProfileUuid, query.sort)
  }

  @Get(':uuid')
  async getVideoGroup(
    @AuthUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<VideoGroupDto> {
    return this.videosGroupsService.getOneByUserAndBoxProfile(user, boxProfileUuid, uuid)
  }

  @Post()
  async createVideoGroup(
    @AuthUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Body() dto: CreateVideoGroupDto,
  ): Promise<VideoGroupDto> {
    return this.videosGroupsService.createByUser(user, boxProfileUuid, dto)
  }

  @Patch(':uuid')
  async updateVideoGroup(
    @AuthUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateVideoGroupDto,
  ): Promise<VideoGroupDto> {
    return this.videosGroupsService.updateByUser(user, boxProfileUuid, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideoGroup(
    @AuthUser() user: SanitizedUser,
    @Param('boxProfileUuid', new ParseUUIDPipe({ version: '4' })) boxProfileUuid: string,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.videosGroupsService.deleteByUserAndBoxProfile(user, boxProfileUuid, uuid)
  }
}
