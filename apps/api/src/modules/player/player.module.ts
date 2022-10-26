import { Module } from '@nestjs/common'
import { OpxModule } from '../opx/opx.module'

import { PrismaModule } from '../prisma/prisma.module'
import { PlayerController } from './player.controller'
import { PlayerService } from './player.service'

@Module({
  imports: [PrismaModule, OpxModule],
  providers: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}
