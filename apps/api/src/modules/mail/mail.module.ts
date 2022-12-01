import { Global, Module } from '@nestjs/common'
import { MailController } from './mail.controller'
import { MailService } from './mail.service'

/**
 * Email Module that provides an EmailService powered by NodeMailer and AWS SES.
 *
 * Nodemailer enables flexibility with HTML emails, options for template libraries, easy attachments, etc.
 * that are otherwise a pain to implement and maintain with the raw SES client.
 */
@Global()
@Module({
  exports: [MailService],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
