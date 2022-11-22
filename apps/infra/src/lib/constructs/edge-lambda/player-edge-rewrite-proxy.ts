#!/usr/bin/env node

import * as path from 'path'
import { RemovalPolicy } from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'

import { FxBaseConstruct, FxBaseConstructProps } from '../../abstract/fx-base.abstract.construct'
import { FxBaseStack } from '../../abstract/fx-base.abstract.stack'

export interface PlayerEdgeRewriteProxyProps extends FxBaseConstructProps {
  options?: {
    memorySize?: number
    logRetention?: logs.RetentionDays
    enableXRayTracing?: boolean
  }
}

/**
 * Construct that deploys a `Lambda@Edge` reverse proxy for CloudFront that implements reverse proxy behavior
 * suitable for the OliviaParty web player exported as a static site via NextJS static export.
 *
 * For NextJS the config parameter `trailingSlashes: true` is assumed.
 *
 * The edge lambda resource is created in us-east-1 per CloudFront requirements.
 *
 * The edge lambda elegantly handles the following cases to ensure sites + UI's hosted with S3 + CloudFront behave
 * similar to a traditional web server such as Apache2 or nginx:
 *
 * - if the request URI is for /{NANOID_OF_LENGTH_10} it is directed to /[player].html to support the dynamic route
 * - if the request URI has a trailing slash serve /index.html
 * - if the request URI is not for a file (i.e. there is no file extension) serve /index.html
 *
 * @see /apps/infra/lambdas/edge/reverse-proxy
 */
export class PlayerEdgeRewriteProxy extends FxBaseConstruct {
  readonly constructId: string

  readonly lambda: cloudfront.experimental.EdgeFunction

  constructor(parent: FxBaseStack, id: string, props: PlayerEdgeRewriteProxyProps) {
    super(parent, id, props)

    this.constructId = id

    const isXRayTracingEnabled = props.options?.enableXRayTracing
      ? lambda.Tracing.ACTIVE
      : parent.isProductionLike()
      ? lambda.Tracing.ACTIVE
      : lambda.Tracing.DISABLED

    // resources created by `experimental.EdgeFunction` are created in us-east-1 region per CloudFront requirements
    this.lambda = new cloudfront.experimental.EdgeFunction(this, `PlayerRewriteEdgeLambda${this.constructId}`, {
      // specifying a function name reportedly causes a condition where it takes ~1hr to delete the function (should verify if this is stil the case)
      // functionName: `${this.getProjectTag()}-${this.getDeployStageTag()}-edge-reverse-proxy`,

      description: `[${this.getProjectTag()}]-[${this.getDeployStageTag()}] Edge Reverse Proxy for CF + Static Export UI's`,

      code: lambda.Code.fromAsset(path.join(process.cwd(), '/apps/infra/lambdas/edge/player-rewrite-proxy')),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      memorySize: props.options?.memorySize ?? 128,

      logRetention:
        props.options?.logRetention ??
        (parent.isProduction() ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.THREE_DAYS),

      tracing: isXRayTracingEnabled,

      currentVersionOptions: {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    })

    if (isXRayTracingEnabled) {
      this.lambda.role?.addManagedPolicy({
        managedPolicyArn: 'arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess',
      })
    }

    this.printOutputs()
  }

  private printOutputs(): void {
    // new CfnOutput(this, 'Url', { value: `https://${this.uri}` })
  }
}
