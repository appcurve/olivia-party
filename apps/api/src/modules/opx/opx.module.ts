import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { PlayerProfilesService } from './player-profiles.service'
import { OliviaPartyController } from './olivia-party.controller'
import { PhraseListsController } from './phrase-lists.controller'
import { PhraseListsService } from './phrase-lists.service'
import { VideoPlaylistsController } from './video-playlists.controller'
import { VideoPlaylistsService } from './video-playlists.service'
import { VideosController } from './videos.controller'
import { VideosService } from './videos.service'

@Module({
  imports: [PrismaModule],
  providers: [PlayerProfilesService, VideosService, VideoPlaylistsService, PhraseListsService],
  controllers: [OliviaPartyController, VideosController, VideoPlaylistsController, PhraseListsController],
  exports: [PlayerProfilesService, VideosService, VideoPlaylistsService, PhraseListsService],
})
export class OpxModule {}
