import { google } from 'googleapis'
import { Injectable } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'

@Injectable()
export class GoogleService {
  private oauth2Client
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  async getGoogleLink({ ip, userAgent }: GoogleAuthStateType) {
    const scope = encodeURIComponent('email profile')

    // Chuyển Object sang string và mã hóa base64
    const state = Buffer.from(JSON.stringify({ ip, userAgent, timestamp: Date.now() })).toString('base64')

    // Tạo URL đăng nhập bằng hàm chính chủ từ google-auth-library
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // để lấy refresh_token
      prompt: 'consent', // bắt buộc chọn tài khoản mỗi lần
      scope: scope,
      state: state,
    })
    return { url }
  }
}
