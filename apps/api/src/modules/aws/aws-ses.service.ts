import { Injectable, Logger } from '@nestjs/common'
import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
  SendTemplatedEmailCommandOutput,
} from '@aws-sdk/client-ses'
import { ConfigService } from '@nestjs/config'

import { AwsAbstractService } from './aws.abstract.service'

// basic implementation for aws ses send email using aws-sdk v3 client

// @see - https://docs.amazonaws.cn/en_us/sdk-for-javascript/v3/developer-guide/ses-examples-sending-email.html
// @see - https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/javascriptv3/example_code/ses/src/ses_sendemail.js

@Injectable()
export class AwsSesService extends AwsAbstractService<SESClient> {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(configService: ConfigService) {
    super(SESClient, configService)
  }

  private getTruncatedSubject(subject: string): string {
    return `${subject.substring(0, 25)}${subject.length > 25 ? '...' : ''}`
  }

  private getBaseSendEmailParams(
    to: string[] | string,
  ): Pick<SendEmailCommandInput, 'Destination' | 'Source' | 'ReplyToAddresses'> {
    const awsConfig = this.getAwsConfig()

    return {
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
        // CcAddresses: [],
      },
      Source: awsConfig.ses?.mail?.fromAddress,
      ReplyToAddresses: [awsConfig.ses?.mail?.replyToAddress ?? ''],
    }
  }

  async sendEmail(
    to: string[] | string,
    subject: string,
    plainBody: string,
    htmlBody?: string,
  ): Promise<SendEmailCommandOutput> {
    const params: SendEmailCommandInput = {
      ...this.getBaseSendEmailParams(to),
      Message: {
        Body: {
          ...(plainBody
            ? {
                Text: {
                  Charset: 'UTF-8',
                  Data: plainBody,
                },
              }
            : {}),
          ...(htmlBody
            ? {
                Html: {
                  Charset: 'UTF-8',
                  Data: htmlBody,
                },
              }
            : {}),
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
    }

    const truncatedSubject = this.getTruncatedSubject(subject)

    try {
      const data = await this.client.send(new SendEmailCommand(params))

      this.logger.log(`Sent email to <${to}> subject <${truncatedSubject}>`)

      return data
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send email to '${Array.isArray(to) ? to.join(', ') : to}' subject '${truncatedSubject}'`,
        (error instanceof Error && error.stack) || undefined,
      )

      throw error
    }
  }

  async sendTemplatedEmail(
    to: string[] | string,
    templateName: string,
    templateData: Record<string, string>,
  ): Promise<SendTemplatedEmailCommandOutput> {
    const params = {
      ...this.getBaseSendEmailParams(to),
      Template: templateName,
      TemplateData: JSON.stringify(templateData), // data format e.g. '{ "REPLACEMENT_TAG_NAME":"REPLACEMENT_VALUE" }',
    }

    try {
      const data = await this.client.send(new SendTemplatedEmailCommand(params))
      this.logger.log(`Sent templated email to <${to}> using template <${templateName}>`)

      return data
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send templated email to <${
          Array.isArray(to) ? to.join(', ') : to
        }> using template <${templateName}>`,
        error instanceof Error ? error.stack : undefined,
      )

      throw error
    }
  }
}
