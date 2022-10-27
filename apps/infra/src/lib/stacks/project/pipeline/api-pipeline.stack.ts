// import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { SecretValue } from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions'

import { FxBaseStack, type FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'

export interface ApiPipelineStackProps extends FxBaseStackProps {
  cluster: ecs.Cluster
  service: ecs.IBaseService
  containerName: string
  source: {
    github: {
      owner: string
      repo: string
    }
  }
}

export class ApiPipelineStack extends FxBaseStack {
  // readonly githubCredentials: codebuild.GitHubSourceCredentials
  // readonly source: codebuild.ISource
  readonly repository: ecr.IRepository

  // readonly project: codebuild.Project
  // readonly buildSpec: { [key: string]: any }

  // readonly artifacts: {
  //   source: codepipeline.Artifact
  //   build: codepipeline.Artifact
  // }

  constructor(scope: Construct, id: string, props: ApiPipelineStackProps) {
    super(scope, id, props)

    this.repository = ecr.Repository.fromRepositoryName(
      this,
      'Repository',
      `${this.getProjectTag()}-${this.getDeployStageTag()}`,
    )

    // set github source and configure filters to trigger on push/merge to main (default: all pushes and pr's)
    const gitHubSource = codebuild.Source.gitHub({
      owner: props.source.github.owner,
      repo: props.source.github.repo,
      webhook: true,
      webhookFilters: [codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main')],
    })

    // also note githubsourceaction which can take an oauthtoken for github
    // e.g. <https://github.com/nwitte-rocketloans/nx-cdk-demo/blob/main/apps/cdk-pipeline/src/stacks/app-stack.ts>

    // CODEBUILD - project
    const project = new codebuild.Project(this, 'MyProject', {
      projectName: `${this.stackName}`,
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true,
      },
      environmentVariables: {
        CLUSTER_NAME: {
          value: `${props.cluster.clusterName}`,
        },
        ECR_REPO_URI: {
          value: `${this.repository.repositoryUri}`,
        },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: ['env', 'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}'],
          },
          build: {
            commands: [
              'cd flask-docker-app',
              `docker build -t $ECR_REPO_URI:$TAG .`,
              '$(aws ecr get-login --no-include-email)',
              'docker push $ECR_REPO_URI:$TAG',
            ],
          },
          post_build: {
            commands: [
              'echo "In Post-Build Stage"',
              'cd ..',
              'printf \'[{"name":"flask-app","imageUri":"%s"}]\' $ECR_REPO_URI:$TAG > imagedefinitions.json',
              'pwd; ls -al; cat imagedefinitions.json',
            ],
          },
        },
        artifacts: {
          files: ['imagedefinitions.json'],
        },
      }),
    })

    // ***PIPELINE ACTIONS***

    const sourceOutput = new codepipeline.Artifact()
    const buildOutput = new codepipeline.Artifact()

    const sourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'user-name',
      repo: 'amazon-ecs-fargate-cdk-cicd',
      branch: 'main',
      oauthToken: SecretValue.secretsManager('/my/github/token'),
      //oauthToken: cdk.SecretValue.plainText('<plain-text>'),
      output: sourceOutput,
    })

    const buildAction = new codepipelineActions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [buildOutput], // optional
    })

    const manualApprovalAction = new codepipelineActions.ManualApprovalAction({
      actionName: 'Approve',
    })

    const deployAction = new codepipelineActions.EcsDeployAction({
      actionName: 'DeployAction',
      service: props.service, // fargateService.service,
      imageFile: new codepipeline.ArtifactPath(buildOutput, `imagedefinitions.json`),
    })

    // PIPELINE STAGES

    new codepipeline.Pipeline(this, 'MyECSPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        {
          stageName: 'Approve',
          actions: [manualApprovalAction],
        },
        {
          stageName: 'Deploy-to-ECS',
          actions: [deployAction],
        },
      ],
    })

    if (project?.role) {
      this.repository.grantPullPush(project.role)
      project.addToRolePolicy(
        new iam.PolicyStatement({
          actions: [
            'ecs:DescribeCluster',
            'ecr:GetAuthorizationToken',
            'ecr:BatchCheckLayerAvailability',
            'ecr:BatchGetImage',
            'ecr:GetDownloadUrlForLayer',
          ],
          resources: [`${props.cluster.clusterArn}`],
        }),
      )
    }

    //OUTPUT

    // new CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName })
  }
}
