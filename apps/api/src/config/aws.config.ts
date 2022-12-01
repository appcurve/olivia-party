import { registerAs } from '@nestjs/config'
import type { AwsConfig } from './types/aws-config.interface'

export default registerAs('aws', (): AwsConfig => {
  return {
    region: process.env.AWS_REGION ?? '',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
    ses: process.env.AWS_SES_FROM_ADDRESS
      ? {
          region: process.env.AWS_SES_REGION ?? process.env.AWS_REGION ?? '',
          mail: {
            fromName: process.env.AWS_SES_FROM_NAME ?? '',
            fromAddress: process.env.AWS_SES_FROM_ADDRESS ?? '',
            replyToAddress: process.env.AWS_SES_REPLY_TO_ADDRESS ?? '',
            dkimPrivateKey: process.env.AWS_SES_DKIM_PRIVATE_KEY ?? '',
          },
        }
      : undefined,
  }
})
