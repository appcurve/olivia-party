import * as path from 'path'

import { Construct } from 'constructs'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'

import { FxBaseStack, FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'
import { StaticUi } from '../../../constructs/static-ui'
import { CfnOutput } from 'aws-cdk-lib'

export interface UiStackProps extends FxBaseStackProps {
  api: {
    fqdn: string
    basePath: string
  }
}

/**
 * UI stack for the deployment of the OliviaParty manager user interface.
 */
export class UiStack extends FxBaseStack {
  readonly ui: StaticUi

  constructor(scope: Construct, id: string, props: UiStackProps) {
    super(scope, id, props)

    this.ui = new StaticUi(this, 'Ui', {
      source: s3Deployment.Source.asset(path.join(process.cwd(), 'dist/apps/ui/exported')),
      zoneDomain: this.deploy.zoneDomain,
      fqdn: this.deploy.domain,
      api: {
        fqdn: props.api.fqdn,
        basePath: props.api.basePath,
      },
    })

    this.printOutputs()
  }

  private printOutputs(): void {
    new CfnOutput(this, 'UiUrl', { value: `https://${this.ui.fqdn}` })
  }
}
