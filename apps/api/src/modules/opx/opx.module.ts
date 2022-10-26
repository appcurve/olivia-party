import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { BoxService } from './box.service'
import { OliviaPartyController } from './olivia-party.controller'
import { PhraseListsController } from './phrase-lists.controller'
import { PhraseListsService } from './phrase-lists.service'
import { VideoGroupsController } from './video-groups.controller'
import { VideoGroupsService } from './video-groups.service'
import { VideosController } from './videos.controller'
import { VideosService } from './videos.service'

@Module({
  imports: [PrismaModule],
  providers: [BoxService, VideosService, VideoGroupsService, PhraseListsService],
  controllers: [OliviaPartyController, VideosController, VideoGroupsController, PhraseListsController],
  exports: [VideosService, VideoGroupsService, PhraseListsService],
})
export class OpxModule {}
