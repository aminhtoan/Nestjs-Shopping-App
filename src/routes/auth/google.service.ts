import { google } from 'googleapis'
import { Injectable } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'
import { AuthRespository } from './auth.repo'
import { HashinngService } from 'src/shared/services/hashinng.service'
import { RolesService } from './roles.service'
import { v4 as uuidv4 } from 'uuid'
import { AuthService } from './auth.service'

@Injectable()
export class GoogleService {
  private oauth2Client
  constructor(
    private readonly authRespository: AuthRespository,
    private readonly hashinngService: HashinngService,
    private readonly rolesService: RolesService,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  async getGoogleLink({ ip, userAgent }: GoogleAuthStateType) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ]

    // Chuyển Object sang string và mã hóa base64
    const state = Buffer.from(JSON.stringify({ ip, userAgent, timestamp: Date.now() })).toString('base64')

    // Tạo URL đăng nhập bằng hàm chính chủ từ google-auth-library
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // để lấy refresh_token
      prompt: 'consent', // bắt buộc chọn tài khoản mỗi lần
      scope: scopes,
      state: state,
    })
    return { url }
  }

  async GoogleCallBack({ code, state }: { code: string; state: string }) {
    try {
      let userAgent = 'Unknown'
      let ip = 'Unknown'

      // 1 lấy state từ url
      try {
        if (state) {
          const client = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
          userAgent = client.userAgent
          ip = client.ip
        }
      } catch (error) {
        console.log(error)
      }

      // 2 dùng code để lấy token
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)

      // 3 lay thong tin gg user
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
      const { data } = await oauth2.userinfo.get()

      if (!data.email) {
        throw new Error('Không thể lấy thông tin người dùng từ google')
      }

      let user = await this.authRespository.findUniqueUserIncludeRole({
        email: data.email,
      })

      if (!user) {
        const clientRoleId = await this.rolesService.getClientRoleId()
        const randomPassword = uuidv4()
        const hashPass = this.hashinngService.hash(randomPassword)

        user = await this.authRespository.createUserWithGoogle({
          email: data.email,
          name: data.name ?? '',
          phoneNumber: '',
          roleId: clientRoleId,
          password: hashPass,
          avatar: data.picture ?? null,
        })
      }

      const device = await this.authRespository.createDevice({
        userId: user.id,
        ip: ip,
        userAgent: userAgent,
      })

      const authtokens = await this.authService.generateToken({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })
      return authtokens
    } catch (error) {
      console.log(error)
      throw new Error('Đăng nhập bằng google thất bại')
    }
  }
}
