import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as aws from '@aws-sdk/client-ses'
import * as nodemailer from 'nodemailer'
import { SentMessageInfo } from 'nodemailer/lib/ses-transport'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

import type { AwsConfig } from '../../config/types/aws-config.interface'
import type { AwsSesConfig } from '../aws/types/aws-module-config.interface'

import { assertNonNullable } from '../../types/type-assertions/assert-non-nullable'

// @see open https://github.com/nodemailer/nodemailer/issues/1430 re @aws-sdk/client-sesv2 support

@Injectable()
export class MailService {
  protected readonly logger = new Logger(this.constructor.name)

  private readonly sesConfig: AwsSesConfig
  private readonly ses: aws.SESClient
  private readonly transporter: nodemailer.Transporter<SentMessageInfo>

  constructor(private configService: ConfigService) {
    const awsConfig = this.configService.get<AwsConfig>('aws')
    assertNonNullable(awsConfig)
    assertNonNullable(awsConfig.ses)

    this.sesConfig = awsConfig.ses

    // nodemailer docs examples use SES vs. SESClient
    this.ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: awsConfig.ses?.region,
      credentials: {
        accessKeyId: awsConfig.credentials.accessKeyId,
        secretAccessKey: awsConfig.credentials.secretAccessKey,
      },
      credentialDefaultProvider: defaultProvider,
    })

    this.transporter = nodemailer.createTransport({
      SES: {
        ses: this.ses,
        aws: aws,
      },
      from: this.sesConfig.mail.fromAddress,
      dkim: {
        keySelector: 'dkim', // @todo need from env as well
        domainName: this.sesConfig.mail.fromAddress.match(/^[^@]+@(?<domain>.+)$/)?.groups?.domain ?? '', // try ses sub
        privateKey: this.sesConfig.mail.dkimPrivateKey,

        // in future if sending large emails remember to use a cache...
        // or better yet: have a different service handle them vs. project api
        // cacheDir: "/tmp",
        // cacheTreshold: 100 * 1024 // not a typo (at least in this code window)

        // do not sign these header keys with ses as it has its own message-id and date system
        skipFields: 'message-id:date',
      },
    })
  }

  sendEmail(options: nodemailer.SendMailOptions): Promise<SentMessageInfo> {
    return this.transporter.sendMail(options)
  }

  async sendTextEmail(
    to: nodemailer.SendMailOptions['to'],
    subject: string,
    text: string,
    options?: Omit<nodemailer.SendMailOptions, 'to' | 'subject' | 'text' | 'html' | 'watchHtml'>,
  ): Promise<SentMessageInfo> {
    const x = this.sesConfig.mail.fromAddress.match(/^[^@]+@(?<domain>.+)$/)?.groups?.domain ?? ''
    this.logger.log(`confirming domain: ${x} `)
    const info = await this.transporter.sendMail({
      to,
      from: this.sesConfig.mail.fromAddress,
      subject,
      text,
      envelope: {
        from: `${this.sesConfig.mail.fromName} <${this.sesConfig.mail.fromAddress}>`,
      },
      ...(options || {}),
    })

    this.logger.log({ messageId: info.messageId, envelope: info.envelope, subject })
    return info
  }

  // stub
  // async sendRichEmail(
  //   to: nodemailer.SendMailOptions['to'],
  //   subject: string,
  //   body: {
  //     html: nodemailer.SendMailOptions['html']
  //     text?: nodemailer.SendMailOptions['text']
  //   },
  //   options?: Omit<nodemailer.SendMailOptions, 'to' | 'subject' | 'html' | 'text'>,
  // ): Promise<SentMessageInfo> {
  //   const info = await this.transporter.sendMail({
  //     to,
  //     subject,
  //     text: body.text,
  //     html: body.html,
  //     envelope: {
  //       from: `${this.sesConfig.mail.fromName} <${this.sesConfig.mail.fromAddress}>`,
  //     },
  //     ...(options || {}),
  //   })

  //   this.logger.log({ messageId: info.messageId, envelope: info.envelope, subject })
  //   return info
  // }

  // stub
  // async sendTemplateEmail(
  //   to: nodemailer.SendMailOptions['to'],
  //   subject: string,
  //   body: {
  //     html: nodemailer.SendMailOptions['html']
  //     text?: nodemailer.SendMailOptions['text']
  //   },
  //   options?: Omit<nodemailer.SendMailOptions, 'to' | 'subject' | 'html' | 'text'>,
  // ): Promise<SentMessageInfo> {
  //   const info = await this.transporter.sendMail({
  //     to,
  //     subject,
  //     text: body.text,
  //     html: body.html,
  //     envelope: {
  //       from: `${this.sesConfig.mail.fromName} <${this.sesConfig.mail.fromAddress}>`,
  //     },
  //     ...(options || {}),
  //   })

  //   this.logger.log({ messageId: info.messageId, envelope: info.envelope, subject })
  //   return info
  // }

  // sendUserVerification(user: SanitizedUser) {}
  // sendUserPasswordReset(user: SanitizedUser) {}
}
