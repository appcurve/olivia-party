import { Injectable } from '@nestjs/common'

import { PlayerApp } from '@firx/op-data-api'
import type { Nid } from '@firx/op-data-api'

import { PrismaService } from '../prisma/prisma.service'
import { PrismaUtilsService } from '../prisma/prisma-utils.service'
import { VideoGroupsService } from '../opx/video-groups.service'
import { PhraseListsService } from '../opx/phrase-lists.service'
import { PlayerDto } from './dto/player.dto'

@Injectable()
export class PlayerService {
  // private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaUtils: PrismaUtilsService, // @Inject(forwardRef(() => BoxService)) // private readonly boxService: BoxService,
    private readonly videoGroupsService: VideoGroupsService,
    private readonly phraseListService: PhraseListsService,
  ) {}

  // @future optimization - transactions for query vs. multiple queries
  async findByCode(nid: Nid): Promise<PlayerDto> {
    const playerProfile = await this.prisma.boxProfile.findFirstOrThrow({
      select: {
        name: true,
      },
      where: {
        urlCode: nid,
      },
    })

    const [videoGroups, phraseLists] = await Promise.all([
      this.videoGroupsService.findByPlayerProfileCode(nid, true),
      this.phraseListService.findByPlayerProfileCode(nid, true),
    ])

    return new PlayerDto({
      name: playerProfile.name,
      apps: [
        { app: PlayerApp.OpVideoApp, data: videoGroups },
        { app: PlayerApp.OpSpeechApp, data: phraseLists },
      ],
    })
  }
}
