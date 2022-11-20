import { Injectable } from '@nestjs/common'

import { PlayerApp, type PlayerAppsDto } from '@firx/op-data-api'
import type { Nid } from '@firx/op-data-api'

import { PrismaService } from '../prisma/prisma.service'
import { VideoPlaylistsService } from '../opx/video-playlists.service'
import { PhraseListsService } from '../opx/phrase-lists.service'
import { PlayerAppsApiDto } from './dto/player-app.api-dto'

@Injectable()
export class PlayersService {
  // private logger = new Logger(this.constructor.name)

  constructor(
    private readonly prisma: PrismaService,

    private readonly videoPlaylistsService: VideoPlaylistsService,
    private readonly phraseListService: PhraseListsService,
  ) {}

  // @future optimization - transactions for query vs. multiple queries
  async findByCode(nid: Nid): Promise<PlayerAppsDto> {
    const playerProfile = await this.prisma.player.findFirstOrThrow({
      select: {
        name: true,
      },
      where: {
        urlCode: nid,
      },
    })

    // >1 of each type of OP-App is supported
    const [videoPlaylists, phraseLists] = await Promise.all([
      this.videoPlaylistsService.findByPlayerCode(nid, true),
      this.phraseListService.findByPlayerCode(nid, true),
    ])

    return PlayerAppsApiDto.create({
      name: playerProfile.name,
      apps: [
        { app: PlayerApp.OpVideoApp, data: videoPlaylists },
        { app: PlayerApp.OpSpeechApp, data: phraseLists },
      ],
    })
  }
}
