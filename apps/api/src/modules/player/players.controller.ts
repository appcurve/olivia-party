import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import type { PlayerAppsDto } from '@firx/op-data-api'
import { PublicRouteHandler } from '../auth/decorators/public-route-handler.decorator'
import { PlayersService } from './players.service'
import { ParseNanoidPipe } from '../../shared/pipes/parse-nanoid-pipe'

const CONTROLLER_NAME = 'player'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@PublicRouteHandler()
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(':nid')
  async getPlayerData(@Param('nid', new ParseNanoidPipe({ length: 10 })) nid: string): Promise<PlayerAppsDto> {
    return this.playersService.findByCode(nid)
  }
}
