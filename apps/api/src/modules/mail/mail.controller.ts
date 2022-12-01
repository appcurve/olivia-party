import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AuthUser } from '../auth/decorators/auth-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { MailService } from './mail.service'

const CONTROLLER_NAME = 'email'

@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(private readonly emailService: MailService) {}

  @Get()
  async testEmail(@AuthUser() _user: AuthUser): Promise<void> {
    await this.emailService.sendTextEmail(
      'kevin.firko+aws@gmail.com',
      'test test nodemailer try ses.olivia.party sub',
      'test email hello world it was probably the key selector :D',
    )
    return
  }
}
