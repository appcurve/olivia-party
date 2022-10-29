#!/usr/bin/env node

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import type { BaseProps } from './types/props.types'
import { DeployStage } from './constants/deploy-stage.enum'
import { CoreStack } from './lib/stacks/core/core.stack'
import { RdsStack } from './lib/stacks/project/rds.stack'
import { EcrStack } from './lib/stacks/core/ecr.stack'
import { EcsStack } from './lib/stacks/core/ecs.stack'
import { PlayerStack } from './lib/stacks/project/apps/player.stack'
import { ApiStack } from './lib/stacks/project/apps/api.stack'
import { UiStack } from './lib/stacks/project/apps/ui.stack'

const account = process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION

const env = { account, region }

const PROJECT_TAG = 'olivia'
const PROJECT_DOMAIN = 'olivia.party'

const getDeployDomainOrStageSubdomain = (stage: DeployStage): string => {
  return stage === DeployStage.PRODUCTION ? PROJECT_DOMAIN : `${stage.toLowerCase()}.${PROJECT_DOMAIN}`
}

const getBaseProps = (stage: DeployStage): BaseProps => {
  return {
    meta: {
      owner: 'hello@firxworx.com',
      repo: 'appcurve/olivia-party',
    },
    project: {
      name: 'olivia-party',
      tag: PROJECT_TAG,
    },
    deploy: {
      stage,
      // add a zoneDomain to use as base for zone lookups? cover cases where subs have their own hosted zones vs. universal
      zoneDomain: PROJECT_DOMAIN, // only one hosted zone at apex domain for now
      domain: getDeployDomainOrStageSubdomain(stage),
      options: {
        // save costs with a less-than-production-grade configuration
        useNonProductionDefaults: true,
      },
    },
  }
}

const app = new cdk.App()

// deploy core stack to build VPC + bastion (jump box)
const coreStackProd = new CoreStack(app, 'CoreStackProd', {
  env,
  description: `[${PROJECT_TAG}] - Core Infra Stack`,
  ...getBaseProps(DeployStage.PRODUCTION),
})

// deploy ecs cluster
const ecsStackProd = new EcsStack(app, 'EcsStackProd', {
  env,
  description: `[${PROJECT_TAG}] - ECS Container Stack`,
  vpc: coreStackProd.vpc,
  ...getBaseProps(DeployStage.PRODUCTION),
})

// deploy ecr repo to house the api's docker images
const ecrStackProd = new EcrStack(app, 'EcrStackProd', {
  env,
  description: `[${PROJECT_TAG}] - ECR Repo Stack`,
  ...getBaseProps(DeployStage.PRODUCTION),
})

// deploy aws rds postgres instance
const rdsStackProd = new RdsStack(app, 'RdsStackProd', {
  env,
  description: `[${PROJECT_TAG}] - RDS Postgres Stack`,
  vpc: coreStackProd.vpc,
  bastion: coreStackProd.bastion,
  ...getBaseProps(DeployStage.PRODUCTION),
})

// deploy api to fargate with an application load balancer (image must be pushed to ECR)
const ApiStackProd = new ApiStack(app, 'ApiStackProd', {
  env,
  description: `[${PROJECT_TAG}] - API Stack`,
  vpc: coreStackProd.vpc,
  cluster: ecsStackProd.cluster,
  ecrRepository: ecrStackProd.repository.repositoryName,
  database: {
    instance: rdsStackProd.instance,
    proxy: rdsStackProd.proxy,
    credentials: {
      secret: rdsStackProd.credentials.secret,
    },
  },
  ...getBaseProps(DeployStage.PRODUCTION),
})

// deploy ui/website stack to baseProps' deploy.domain (for production this is the apex domain)
const _uiStackProd = new UiStack(app, 'UiStackProd', {
  env,
  description: `[${PROJECT_TAG}] - Public UI Stack`,
  api: {
    fqdn: ApiStackProd.api.uri.loadBalancer,
    basePath: ApiStackProd.api.paths.basePath,
  },
  ...getBaseProps(DeployStage.PRODUCTION),
})

// deploy player stack to the given subdomain name on baseProps' deploy.domain
const _playerStackProd = new PlayerStack(app, 'PlayerStackProd', {
  env,
  description: `[${PROJECT_TAG}] - Player UI Stack`,
  subdomain: 'player',
  api: {
    fqdn: ApiStackProd.api.uri.loadBalancer,
    basePath: ApiStackProd.api.paths.basePath,
  },
  ...getBaseProps(DeployStage.PRODUCTION),
})
