import type { AwsCredentials } from './aws-credentials.interface'

export interface AwsModuleConfig {
  region: string
  credentials: AwsCredentials
  ses?: AwsSesConfig
}

export interface AwsSesConfig {
  region: string
  mail: {
    fromName: string
    fromAddress: string
    replyToAddress: string
    dkimPrivateKey: string
  }
}
