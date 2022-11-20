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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PhraseListDto, SanitizedUserInternalDto } from '@firx/op-data-api'
import { validationPipeOptions } from '../../shared/validation-pipe.options'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PhraseListsService } from './phrase-lists.service'
import { CreatePhraseListApiDto, UpdatePhraseListApiDto } from './dto/op-apps/phrases.api-dto'

const CONTROLLER_NAME = 'opx/:player/phrases'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe(validationPipeOptions))
export class PhraseListsController {
  constructor(private readonly phraseListsService: PhraseListsService) {}

  // query all the phrase groups associated with the box profile (@future support optional ?active=true/false flag?)
  @Get()
  async getPhraseGroups(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
  ): Promise<PhraseListDto[]> {
    return this.phraseListsService.findAllByUser(user, playerUuid)
  }

  // query a single phrase group
  @Get(':phraseListUuid')
  async getPhraseGroup(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('phraseListUuid', new ParseUUIDPipe({ version: '4' })) phraseListUuid: string,
  ): Promise<PhraseListDto> {
    return this.phraseListsService.getOneByUser(user, playerUuid, phraseListUuid)
  }

  @Post()
  async createPhraseGroup(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Body() dto: CreatePhraseListApiDto,
  ): Promise<PhraseListDto> {
    return this.phraseListsService.createByUser(user, playerUuid, dto)
  }

  @Patch(':phraseListUuid')
  async updatePhraseGroup(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('phraseListUuid', new ParseUUIDPipe({ version: '4' })) phraseListUuid: string,
    @Body() dto: UpdatePhraseListApiDto,
  ): Promise<PhraseListDto> {
    return this.phraseListsService.updateByUser(user, playerUuid, phraseListUuid, dto)
  }

  @Delete(':phraseListUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseGroup(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('phraseListUuid', new ParseUUIDPipe({ version: '4' })) phraseListUuid: string,
  ): Promise<void> {
    return this.phraseListsService.deleteByUser(user, playerUuid, phraseListUuid)
  }
}
