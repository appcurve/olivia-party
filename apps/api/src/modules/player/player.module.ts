import { Module } from '@nestjs/common'
import { OpxModule } from '../opx/opx.module'

import { PrismaModule } from '../prisma/prisma.module'
import { PlayersController } from './players.controller'
import { PlayersService } from './players.service'

@Module({
  imports: [PrismaModule, OpxModule],
  providers: [PlayersService],
  controllers: [PlayersController],
})
export class PlayerModule {}
