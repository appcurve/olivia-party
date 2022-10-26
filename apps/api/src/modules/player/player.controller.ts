import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PlayerDto } from '@firx/op-data-api'
import { PublicRouteHandler } from '../auth/decorators/public-route-handler.decorator'
import { PlayerService } from './player.service'

const CONTROLLER_NAME = 'player'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@PublicRouteHandler()
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':nid')
  async getPlayerData(@Param('nid') nid: string): Promise<PlayerDto> {
    return this.playerService.findByCode(nid)
  }
}