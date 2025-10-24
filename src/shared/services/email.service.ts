import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import * as fs from 'fs'

@Injectable()
export class SendEmail {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  async sendEmail(payload: { email: string; code: string }) {
    try {
      const data = await this.resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        // do đang ở trong môi trường sandbox nên trong resend ta chỉ có thể gửi email đến trường chúng ta đăng ký,
        to: ['minhtoanpham1412@gmail.com'],
        subject: 'Verify your new Shopping account',
        html: `
        <div style="padding: 20px;">
            <p>Xin chào <strong>${payload.email}</strong>,</p>
            <p color: #007bff;">Mã OTP của bạn là: <strong> ${payload.code}</strong></p>
            <p>Mã này sẽ hết hạn sau <strong> 5 phút</strong>.</p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi ❤️</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #666;">
            © 2025 FastFood. All rights reserved.
        </div>`,
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
