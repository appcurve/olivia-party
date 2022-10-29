import * as path from 'path'

import { Construct } from 'constructs'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'

import { FxBaseStack, FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'
import { StaticUi } from '../../../constructs/static-ui'
import { CfnOutput } from 'aws-cdk-lib'

export interface PlayerStackProps extends FxBaseStackProps {
  subdomain: string
  api: {
    fqdn: string
    basePath: string
  }
}

/**
 * Player stack for the deployment of the OliviaParty web player to a dedicated subdomain.
 */
export class PlayerStack extends FxBaseStack {
  readonly player: StaticUi

  constructor(scope: Construct, id: string, props: PlayerStackProps) {
    super(scope, id, props)

    if (props.subdomain.includes(this.deploy.domain)) {
      throw new Error(`PlayerStackProps property 'subdomain' must be the subdomain segment name only (not an FQDN).`)
    }

    this.player = new StaticUi(this, 'Player', {
      source: s3Deployment.Source.asset(path.join(process.cwd(), 'dist/apps/player/exported')),
      zoneDomain: this.deploy.zoneDomain,
      fqdn: `${props.subdomain}.${this.deploy.domain}`,
      api: {
        fqdn: props.api.fqdn,
        basePath: props.api.basePath,
      },
      options: {
        usePlayerRewriteProxy: true,
        disableCloudFrontCache: true,
      },
    })

    this.printOutputs()
  }

  private printOutputs(): void {
    new CfnOutput(this, 'PlayerUrl', { value: `https://${this.player.fqdn}` })
  }
}
