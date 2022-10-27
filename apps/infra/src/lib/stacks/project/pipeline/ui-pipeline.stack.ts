// import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Duration, SecretValue } from 'aws-cdk-lib'
// import * as ecr from 'aws-cdk-lib/aws-ecr'
// import * as ecs from 'aws-cdk-lib/aws-ecs'
// import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions'

import { FxBaseStack, type FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'

export interface UiPipelineStackProps extends FxBaseStackProps {
  s3AssetsBucket: s3.Bucket
  source: {
    github: {
      owner: string
      repo: string
    }
  }
}

export class UiPipelineStack extends FxBaseStack {
  // readonly githubCredentials: codebuild.GitHubSourceCredentials
  // readonly source: codebuild.ISource

  // readonly project: codebuild.Project
  // readonly buildSpec: { [key: string]: any }

  // readonly artifacts: {
  //   source: codepipeline.Artifact
  //   build: codepipeline.Artifact
  // }

  constructor(scope: Construct, id: string, props: UiPipelineStackProps) {
    super(scope, id, props)

    // // set github source and configure filters to trigger on push/merge to main (default: all pushes and pr's)
    // const gitHubSource = codebuild.Source.gitHub({
    //   owner: 'user-name',
    //   repo: 'amazon-ecs-fargate-cdk-cicd',
    //   webhook: true,
    //   webhookFilters: [codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main')],
    // })
    const sourceOutput = new codepipeline.Artifact()
    const buildHtmlOutput = new codepipeline.Artifact('base')
    const buildStaticOutput = new codepipeline.Artifact('static')

    new codepipeline.Pipeline(this, 'Pipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipelineActions.GitHubSourceAction({
              actionName: 'Checkout',
              owner: props.source.github.owner,
              repo: props.source.github.owner,
              oauthToken: SecretValue.secretsManager('/path/to/secret'),
              output: sourceOutput,
              trigger: codepipelineActions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: 'Webapp',
              project: new codebuild.PipelineProject(this, 'Build', {
                projectName: 'ReactSample',
                buildSpec: codebuild.BuildSpec.fromObject({
                  version: '0.2',
                  phases: {
                    install: {
                      commands: ['npm install'],
                    },
                    build: {
                      commands: 'npm run build',
                    },
                  },
                  artifacts: {
                    'secondary-artifacts': {
                      [buildHtmlOutput.artifactName as string]: {
                        'base-directory': 'dist',
                        files: ['*'],
                      },
                      [buildStaticOutput.artifactName as string]: {
                        'base-directory': 'dist',
                        files: ['static/**/*'],
                      },
                    },
                  },
                }),
                environment: {
                  // @see https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html
                  buildImage: codebuild.LinuxBuildImage.STANDARD_6_0, // ubuntu 22.04
                  // buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4, // amazonlinux 2 x86_64 4.0

                  // for more custom builds w/ docker...
                  // buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                  // computeType: codebuild.ComputeType.LARGE,
                  // privileged: true, // true = run docker daemon inside docker container - has caveats, see docs
                },
              }),
              input: sourceOutput,
              outputs: [buildStaticOutput, buildHtmlOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipelineActions.S3DeployAction({
              actionName: 'Static-Assets',
              input: buildStaticOutput,
              bucket: props.s3AssetsBucket,
              cacheControl: [
                codepipelineActions.CacheControl.setPublic(),
                codepipelineActions.CacheControl.maxAge(Duration.days(1)),
              ],
              runOrder: 1,
            }),
            new codepipelineActions.S3DeployAction({
              actionName: 'HTML-Assets',
              input: buildHtmlOutput,
              bucket: props.s3AssetsBucket,
              cacheControl: [codepipelineActions.CacheControl.noCache()],
              runOrder: 2,
            }),
          ],
        },
      ],
    })
  }
}
