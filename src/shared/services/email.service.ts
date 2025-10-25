import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import * as fs from 'fs'
import path from 'path'

@Injectable()
export class SendEmail {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }
  async sendEmail(payload: { email: string; code: string }) {
    try {
      const templatePath = path.join(process.cwd(), 'src/shared/email-templates/otp.html')
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
      const subject = 'Verify your new Shopping account'
      htmlTemplate = htmlTemplate.replace('{{OTP_CODE}}', payload.code)
      htmlTemplate = htmlTemplate.replace('{{subject}}', subject)

      const data = await this.resend.emails.send({
        from: 'Nestjs Ecomerce <no-reply@miti.io.vn>',
        to: [payload.email],
        subject,
        html: htmlTemplate,
      })
      return data
    } catch (error) {
      throw new UnprocessableEntityException([
        {
          message: 'Lỗi gửi otp',
          path: 'code',
        },
      ])
    }
  }
}
