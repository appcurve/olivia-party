#!/usr/bin/env node

import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'

import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import { FxBaseConstruct, FxBaseConstructProps } from '../abstract/fx-base.abstract.construct'
import { FxBaseStack } from '../abstract/fx-base.abstract.stack'
import { EdgeRewriteProxy } from './edge-lambda/edge-rewrite-proxy'
import { PlayerEdgeRewriteProxy } from './edge-lambda/player-edge-rewrite-proxy'

export interface StaticUiProps extends FxBaseConstructProps {
  /** Fully-qualified-domain-name (FQDN) of the deploy: a domain or subdomain. */
  fqdn: string

  /** Domain or subdomain of the Route53 hosted zone that the `fqdn` belongs to. */
  zoneDomain: string

  /** Source of the UI static export to deploy (e.g. for NextJS `dist/apps/{APP_NAME}/.next/static`). */
  source: s3Deployment.ISource

  /**
   * Optionally configure CloudFront to reverse-proxy requests to the /api/* path to a back-end API
   * at the specified uri.
   */
  api?: {
    /** FQDN of target resource e.g. uri to an ALB, API gateway, etc. */
    fqdn: string

    /**
     * Base path of the API at the target e.g. load balancer.
     *
     * The given value must have a leading slash. The project convention is: `/{PROJECT_TAG}`.
     *
     * This value is used to set the CloudFront originPath for the 'api/*' route such that the target will
     * receive forwarded requests made for the public-facing /api route as `{basePath}/api/*`.
     *
     * The convention of using a base path in this way supports sharing a load balancer across multiple apps
     * and projects where each project has a unique project tag by following this convention.
     *
     * CloudFront's default originPath is '/'.
     */
    basePath?: string
  }

  options?: {
    /**
     * Configure deployment as a single-page-app (SPA).
     * When `true`, errors are redirected back to `index.html`.
     *
     * This configuration generally option suits UI's bootstrapped via create-react-app (CRA).
     *
     * The default is `false` which is ideal for NextJS static site exports where NextJS is
     * configured with `trailingSlash: true` and the project implements dedicated error pages.
     */
    isSinglePageApp?: boolean
    disableCloudFrontCacheInDevelopment?: boolean
    disableCloudFrontCache?: boolean
    cloudFront?: {
      priceClass?: cloudfront.PriceClass
    }

    /** Flag to use the alternate edge lamdbda rewrite proxy for the OP web player. */
    usePlayerRewriteProxy?: boolean
  }
}

/**
 * Static webapp UI infrastructure that stores assets on S3 and leverages CloudFront as a CDN.
 * TLS (SSL) is provided via ACM.
 *
 * This construct creates a private S3 bucket for site assets and CloudFront accesses them via OAI.
 * The bucket is not configured as a public website hosting bucket because this is now considered to be
 * a legacy approach.
 *
 * The configuration is intended for compatibility with NestJS' static build/export option. The following
 * is assumed for `next.config.js`:
 *
 * - `trailingSlash: true`
 * - no `basePath` set
 *
 * For edge lambdas be aware of "Edge Function Restrictions" (link to doc below).
 *
 * @see {@link https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront-readme.html}
 * @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html}
 */
export class StaticUi extends FxBaseConstruct {
  readonly constructId: string

  readonly buckets: {
    assets: s3.Bucket
    logs: s3.Bucket
  }

  readonly fqdn: string

  readonly certificate: acm.ICertificate
  readonly zone: route53.IHostedZone
  readonly record: route53.ARecord

  readonly deployment: s3Deployment.BucketDeployment

  readonly cloudfront: {
    oai: cloudfront.OriginAccessIdentity
    distribution: cloudfront.Distribution
  }

  constructor(parent: FxBaseStack, id: string, props: StaticUiProps) {
    super(parent, id, props)

    this.constructId = id

    this.fqdn = props.fqdn
    this.zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.zoneDomain })

    // aws has a new method for integrating cloudfront + s3 vs. origin access control however no cdk support yet
    // @see https://github.com/aws/aws-cdk/issues/21771
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: `[${this.getProjectTag()}]-${this.getDeployStageTag()} ORI for ${this.fqdn}`,
    })

    // s3 bucket for site assets - the bucket name should match uri in s3 hosting scenarios
    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: this.fqdn,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: parent.isProduction() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // !parent.isProduction(),
      lifecycleRules: [
        { abortIncompleteMultipartUploadAfter: Duration.days(7) },
        // { noncurrentVersionExpiration: Duration.days(7) },
      ],

      // to enable bucket versioning for production:
      // versioned: parent.isProduction(),
    })

    const logsBucket = new s3.Bucket(this, 'LogsBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: parent.isProduction() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !parent.isProduction(),
    })

    this.buckets = {
      assets: assetsBucket,
      logs: logsBucket,
    }

    // this.buckets.assets.grantRead(cloudfrontOAI.grantPrincipal) // principals: [cloudfrontOAI.grantPrincipal]
    const cloudfrontPolicyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [assetsBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
    })

    this.buckets.assets.addToResourcePolicy(cloudfrontPolicyStatement)

    const httpsOnlyPolicyStatement = new iam.PolicyStatement({
      sid: 'HttpsOnly',
      resources: [`${this.buckets.assets.bucketArn}/*`],
      actions: ['*'],
      principals: [new iam.AnyPrincipal()],
      effect: iam.Effect.DENY,
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false',
        },
      },
    })

    this.buckets.assets.addToResourcePolicy(httpsOnlyPolicyStatement)

    // create TLS certificate for CloudFront in the required us-east-1 region
    this.certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: this.fqdn,
      hostedZone: this.zone,
      region: 'us-east-1',
    })

    const rewriteProxyEdgeLambda =
      props.options?.usePlayerRewriteProxy === true
        ? new PlayerEdgeRewriteProxy(parent, `EdgePlayer${this.constructId}`, {})
        : new EdgeRewriteProxy(parent, `EdgeRewrite${this.constructId}`, {})

    // consider defining an origin request policy (note: be careful causing signature mismatch vs. the cache policy)
    // const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
    //   originRequestPolicyName: 'ExamplePolicy',
    //   comment: 'Default policy',
    //   cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
    //   headerBehavior: cloudfront.OriginRequestHeaderBehavior.all('X-X-X'),
    //   queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.allowList('example'),
    // })

    // default cache policy but with query strings enabled
    const cachePolicy = new cloudfront.CachePolicy(this, 'DefaultCachePolicy', {
      ...cloudfront.CachePolicy.CACHING_OPTIMIZED,
      comment: 'CACHING_OPTIMIZED extended w/ explicit ALL query strings',

      // queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      // headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      // cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      //
      // example for nextjs images
      // queryStringBehavior: cloudfront.CacheQueryStringBehavior.allowList(...['url', 'w', 'q']),

      // manual set
      // maxTtl: cdk.Duration.seconds(1),
      // minTtl: cdk.Duration.seconds(0),
      // defaultTtl: cdk.Duration.seconds(0),

      // enable cache and pass all query strings to S3 to support dynamic routing
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      cookieBehavior: {
        behavior: 'all',
      },

      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
    })

    // normalize -- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html#lambda-examples-query-string-examples

    // warning: do not set defaultRootObject when using the rewrite proxy edge lambda and/or /api/* behaviors
    // warning: be careful setting a defaultBehavior.originRequestPolicy as it can cause signatures to not match vs s3

    // be aware of:
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate: this.certificate,
      domainNames: [this.fqdn],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: props.options?.cloudFront?.priceClass ?? cloudfront.PriceClass.PRICE_CLASS_100, // 100 = US, CA, EU, IS

      enableLogging: true,
      logIncludesCookies: true,
      logBucket: this.buckets.logs,
      logFilePrefix: `${this.getProjectTag()}-${this.getDeployStageTag()}-cloudfront/`,

      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(assetsBucket, { originAccessIdentity: cloudfrontOAI }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,

        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        // cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,

        // originRequestPolicy
        // responseHeadersPolicy

        cachePolicy:
          parent.isDevelopment() && !!props.options?.disableCloudFrontCacheInDevelopment
            ? cloudfront.CachePolicy.CACHING_DISABLED
            : props.options?.disableCloudFrontCache
            ? cloudfront.CachePolicy.CACHING_DISABLED
            : cachePolicy,

        edgeLambdas: [
          {
            functionVersion: rewriteProxyEdgeLambda.lambda.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
      },

      // conditionally additional behavior for the `api/*` route to forward matching requests to the back-end api
      ...(props.api ? { additionalBehaviors: this.getDistributionAdditionalBehaviorsForApi(props.api.fqdn) } : {}),

      // redirect unknown routes back to index.html if configuration is for an SPA
      ...(props.options?.isSinglePageApp
        ? {
            errorResponses: [403, 404].map((httpStatus) => ({
              httpStatus,
              responseHttpStatus: 200,
              responsePagePath: '/index.html',
              ttl: Duration.minutes(5),
            })),
          }
        : {
            errorResponses: [404, 500].map((httpStatus) => ({
              httpStatus,
              responseHttpStatus: httpStatus,
              responsePagePath: `/${httpStatus}/index.html`,
              ttl: Duration.minutes(5),
            })),
          }),
    })

    // this.buckets.logs.grantPutAcl(...)

    this.cloudfront = {
      oai: cloudfrontOAI,
      distribution,
    }

    this.record = new route53.ARecord(this, 'DnsAliasRecord', {
      zone: this.zone,
      recordName: this.fqdn,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.cloudfront.distribution)),
    })

    this.deployment = new s3Deployment.BucketDeployment(this, 'S3DeployWithInvalidation', {
      sources: [props.source], // [s3Deployment.Source.asset(path.join(process.cwd(), 'dist/apps/ui/exported'))],
      destinationBucket: this.buckets.assets,
      distribution: this.cloudfront.distribution,
      distributionPaths: ['/*'],
      memoryLimit: parent.isProduction() ? 256 : undefined, // increase to support larger files (default 128MiB)

      // @see https://github.com/aws/aws-cdk/tree/main/packages/%40aws-cdk/aws-s3-deployment#retain-on-delete
      retainOnDelete: !parent.isProduction(),
    })

    this.printOutputs()
  }

  private printOutputs(): void {
    new CfnOutput(this, 'DeployUrl', { value: `https://${this.fqdn}` })
    new CfnOutput(this, 'S3AssetsBucket', { value: this.buckets.assets.bucketName })
    new CfnOutput(this, 'S3LogsBucket', { value: this.buckets.logs.bucketName })
    new CfnOutput(this, 'CertificateArn', { value: this.certificate.certificateArn })
    new CfnOutput(this, 'CloudFrontDistributionId', { value: this.cloudfront.distribution.distributionId })
  }

  /**
   * Return CloudFront distribution additional behaviors configured for a back-end API for requests to path `api/*`.
   *
   * Sets an origin request policy to `ALL_VIEWER` (all query strings, headers, cookies, etc) and disables CloudFront
   * from caching any responses to this route.
   *
   * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesForwardCookies
   */
  private getDistributionAdditionalBehaviorsForApi(
    targetDomainName: string,
  ): Record<string, cloudfront.BehaviorOptions> {
    return {
      'api/*': {
        // `${httpApi.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`
        origin: new cloudfrontOrigins.HttpOrigin(targetDomainName, {
          originPath: `/${this.getProjectTag()}`, // ALB will receive requests at path /{projectTag}/api/*
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          httpsPort: 443,
          // @future enhanced security - customHeaders: ... (secret header to identify requests from cloudfront)
          // (alternately could front with an API gateway vs. public ALB)

          // keepAliveTimeout
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,

        // compress: false,
        // responseHeadersPolicy: cloudfront.ResponseHeadersPolicy

        // examples of more specific cache + origin request policies:
        //
        // cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
        //   headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization'),
        // }),
        //
        // originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
        //   cookieBehavior: cloudfront.OriginRequestCookieBehavior.allowList(
        //     'CloudFront-Policy',
        //     'CloudFront-Key-Pair-Id',
        //     'CloudFront-Signature',
        //   ),
        // }),
      },
    }
  }
}

// examples of expanded policy definitions for cases where the shortcuts e.g. ALL_VIEWER, CACHING_DISABLED, etc
// are not suitable and a more nuanced configuration is required:
//
// const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
//   originRequestPolicyName: 'example-origin-request-policy',
//   // specify all(), none(), or allowList(...)
//   cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
//   headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(),
//   queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
// })

// const cachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
//   comment: '...',
//   cookieBehavior: cloudfront.CacheCookieBehavior.all(),
//   headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization', 'Origin', 'X-Api-Key'),
//   queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
//   minTtl: cdk.Duration.seconds(0),
//   maxTtl: cdk.Duration.seconds(0),
//   defaultTtl: cdk.Duration.seconds(0),
//   enableAcceptEncodingBrotli: true,
//   enableAcceptEncodingGzip: true,
// })

// @see https://www.invicti.com/blog/web-security/content-security-policy/ for article on CSP
// const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
//   // comment: '',
//   // corsBehavior: ...
//   // customHeadersBehavior: ...
//   // responseHeadersPolicyName: ...
//   securityHeadersBehavior: {
//     contentSecurityPolicy: {
//       // be careful with olivia-party player as youtube is embedded via an iframe per the youtube api
//       contentSecurityPolicy: `default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors *.${apexDomain}.com;`,
//       override: true,
//     },
//     contentTypeOptions: { override: true },
//     frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
//     referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.NO_REFERRER, override: true },
//     strictTransportSecurity: {
//       accessControlMaxAge: Duration.seconds(63072000),
//       includeSubdomains: true,
//       override: true,
//     },
//     xssProtection: {
//       protection: true,
//       modeBlock: true,
//       override: true,
//     },
//   },
// })
