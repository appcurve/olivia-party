import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  type HealthIndicatorFunction,
  type HealthIndicatorResult,
} from '@nestjs/terminus'
import type { HealthCheckResult } from '@nestjs/terminus'
import { ApiExcludeController } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

import { PrismaHealthIndicator } from './prisma.health-indicator'

import type { HealthConfig } from '../../config/types/health-config.interface'
import { PublicRouteHandler } from '../auth/decorators/public-route-handler.decorator'
import { assertNonNullable } from '../../types/type-assertions/assert-non-nullable'

@ApiExcludeController()
@Controller('health-check')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private healthCheckService: HealthCheckService,
    private httpHealthIndicator: HttpHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  @Get()
  @PublicRouteHandler()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const config = this.configService.get<HealthConfig>('health')

    assertNonNullable(config, 'Error resolving health check config')

    const healthChecks: HealthIndicatorFunction[] = [
      async (): Promise<HealthIndicatorResult> => this.prismaHealthIndicator.isHealthy('database'),

      // async () => this.prismaHealthIndicator.pingCheck('database', { timeout: 1500 }),
    ]

    if (config.httpPingUrl) {
      healthChecks.push(async () => this.httpHealthIndicator.pingCheck('httpPing', config.httpPingUrl ?? ''))
    }

    if (config.maxHeapMiB) {
      healthChecks.push(async () =>
        this.memoryHealthIndicator.checkHeap('memoryHeap', Number(config.maxHeapMiB) * 1024 * 1024),
      )
    }

    if (config.maxRssMiB) {
      healthChecks.push(async () =>
        this.memoryHealthIndicator.checkRSS('memoryRss', Number(config.maxRssMiB) * 1024 * 1024),
      )
    }

    return this.healthCheckService.check(healthChecks)
  }
}
