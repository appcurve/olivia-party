#!/usr/bin/env node

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import type { BaseProps } from './types/props.types'
import { DeployStage } from './constants/deploy-stage.enum'
import { CoreStack } from './lib/stacks/core/core.stack'
import { RdsStack } from './lib/stacks/project/rds.stack'
import { EcrStack } from './lib/stacks/core/ecr.stack'
import { ProjectStack } from './lib/stacks/project/project.stack'
import { EcsStack } from './lib/stacks/core/ecs.stack'

const account = process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT
const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION

const env = { account, region }

const PROJECT_TAG = 'olivia'
const PROJECT_DOMAIN = 'olivia.party'

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
      domain: PROJECT_DOMAIN,
      options: {
        // save costs with a less-than-production-grade configuration
        useNonProductionDefaults: true,
      },
    },
  }
}

const app = new cdk.App()

const coreStackProd = new CoreStack(app, 'CoreStackProd', {
  env,
  description: `[${PROJECT_TAG}] - Core Infra Stack`,
  ...getBaseProps(DeployStage.PRODUCTION),
})

const ecsStackProd = new EcsStack(app, 'EcsStackProd', {
  env,
  description: `[${PROJECT_TAG}] - ECS Container Stack`,
  vpc: coreStackProd.vpc,
  ...getBaseProps(DeployStage.PRODUCTION),
})

const ecrStackProd = new EcrStack(app, 'EcrStackProd', {
  env,
  description: `[${PROJECT_TAG}] - ECR Repo Stack`,
  ...getBaseProps(DeployStage.PRODUCTION),
})

const rdsStackProd = new RdsStack(app, 'RdsStackProd', {
  env,
  description: `[${PROJECT_TAG}] - RDS Postgres Stack`,
  vpc: coreStackProd.vpc,
  bastion: coreStackProd.bastion,
  ...getBaseProps(DeployStage.PRODUCTION),
})

const _projectStackProd = new ProjectStack(app, 'ProjectStackProd', {
  env,
  description: `[${PROJECT_TAG}] - App/Project Stack`,
  vpc: coreStackProd.vpc,
  cluster: ecsStackProd.cluster,
  database: {
    instance: rdsStackProd.instance,
    proxy: rdsStackProd.proxy,
    credentials: {
      secret: rdsStackProd.credentials.secret,
    },
  },
  api: {
    repositoryName: ecrStackProd.repository.repositoryName,
  },
  ...getBaseProps(DeployStage.PRODUCTION),
})

// const projectStackDev = new ProjectStack(app, 'ProjectStackDev', {
//   env,
//   vpc: coreStackDev.vpc,
//   ...getBaseProps(DeployStage.DEV, PROJECT_DOMAIN),
// })
