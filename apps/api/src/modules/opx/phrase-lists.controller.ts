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
import { validationPipeOptions } from '../../shared/validation-pipe.options'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SanitizedUser } from '../auth/types/sanitized-user.type'
import { CreatePhraseListDto } from './dto/create-phrase-list.dto'
import { PhraseListDto } from './dto/phrase-list.dto'
import { UpdatePhraseListDto } from './dto/update-phrase-list.dto'
import { PhraseListsService } from './phrase-lists.service'

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
    @AuthUser() user: SanitizedUser,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
  ): Promise<PhraseListDto[]> {
    return this.phraseListsService.findAllByUser(user, playerUuid)
  }

  // query a single phrase group
  @Get(':phraseListUuid')
  async getPhraseGroup(
    @AuthUser() user: SanitizedUser,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('phraseListUuid', new ParseUUIDPipe({ version: '4' })) phraseListUuid: string,
  ): Promise<PhraseListDto> {
    return this.phraseListsService.getOneByUser(user, playerUuid, phraseListUuid)
  }

  @Post()
  async createPhraseGroup(
    @AuthUser() user: SanitizedUser,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Body() dto: CreatePhraseListDto,
  ): Promise<PhraseListDto> {
    return this.phraseListsService.createByUser(user, playerUuid, dto)
  }

  @Patch(':phraseListUuid')
  async updatePhraseGroup(
    @AuthUser() user: SanitizedUser,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('phraseListUuid', new ParseUUIDPipe({ version: '4' })) phraseListUuid: string,
    @Body() dto: UpdatePhraseListDto,
  ): Promise<PhraseListDto> {
    return this.phraseListsService.updateByUser(user, playerUuid, phraseListUuid, dto)
  }

  @Delete(':phraseListUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseGroup(
    @AuthUser() user: SanitizedUser,
    @Param('player', new ParseUUIDPipe({ version: '4' })) playerUuid: string,
    @Param('phraseListUuid', new ParseUUIDPipe({ version: '4' })) phraseListUuid: string,
  ): Promise<void> {
    return this.phraseListsService.deleteByUser(user, playerUuid, phraseListUuid)
  }
}
