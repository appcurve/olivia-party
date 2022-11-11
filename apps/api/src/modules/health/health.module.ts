import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'

import { HealthController } from './health.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { PrismaHealthIndicator } from './prisma.health-indicator'

/**
 * Module implements a health check powered by terminus via `@nestjs/terminus`.
 * This module's `HealthController` exposes a public health check endpoint: `/health-check`.
 */
@Module({
  imports: [ConfigModule, HttpModule, TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
