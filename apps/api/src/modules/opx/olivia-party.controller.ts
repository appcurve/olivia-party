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

import type { SanitizedUserInternalDto } from '@firx/op-data-api'
import { validationPipeOptions } from '../../shared/validation-pipe.options'
import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BoxService } from './box.service'
import { BoxProfileDto } from './dto/box-profile.dto'
import { CreateBoxProfileDto } from './dto/create-box-profile.dto'
import { UpdateBoxProfileDto } from './dto/update-box-profile.dto'

const CONTROLLER_NAME = 'opx'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe(validationPipeOptions))
export class OliviaPartyController {
  constructor(private readonly boxService: BoxService) {}

  @Get()
  async getBoxProfiles(@AuthUser() user: SanitizedUserInternalDto): Promise<BoxProfileDto[]> {
    return this.boxService.findAllByUser(user)
  }

  @Get(':uuid')
  async getBoxProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<BoxProfileDto> {
    return this.boxService.getOneByUser(user, uuid)
  }

  @Post()
  async createBoxProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Body() dto: CreateBoxProfileDto,
  ): Promise<BoxProfileDto> {
    return this.boxService.createByUser(user, dto)
  }

  @Patch(':uuid')
  async updateBoxProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
    @Body() dto: UpdateBoxProfileDto,
  ): Promise<BoxProfileDto> {
    return this.boxService.updateByUser(user, uuid, dto)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(
    @AuthUser() user: SanitizedUserInternalDto,
    @Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string,
  ): Promise<void> {
    return this.boxService.deleteByUser(user, uuid)
  }
}
