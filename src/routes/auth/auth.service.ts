import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms, { type StringValue } from 'ms'
import envConfig from 'src/shared/config'
import { TypeofVerificationCode, TypeofVerificationCodeType } from 'src/shared/constants/auth.constant'
import { generateOTP, isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SendEmail } from 'src/shared/services/email.service'
import { AccessTokenPayLoadCreate } from 'src/shared/types/jwt.type'
import { TokenService } from './../../shared/services/token.service'
import { LoginBodyDTO, RefreshTokenBodyDTO } from './auth.dto'
import { ForgotPasswordType, ResgisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRespository } from './auth.repo'
import { RolesService } from './roles.service'
import { HashingService } from 'src/shared/services/hashing.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRespository: AuthRespository,
    private readonly rolesService: RolesService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sendEmail: SendEmail,
    private readonly tokenService: TokenService,
  ) {}

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeofVerificationCodeType
  }) {
    // kiểm tra code có tồn tại không
    const verificationCode = await this.authRespository.findUniqueVerificationCode({
      email_code_type: {
        email: email,
        code: code,
        type: type,
      },
    })

    if (!verificationCode) {
      throw new UnprocessableEntityException([
        {
          message: 'Mã OTP không hợp lệ',
          path: 'code',
        },
      ])
    }

    // kiểm tra hạn của otp 5m so với giờ hiện tại
    if (verificationCode.expiresAt < new Date()) {
      throw new UnprocessableEntityException([
        {
          message: 'Mã OTP đã hết hạn',
          path: 'code',
        },
      ])
    }

    return verificationCode
  }

  async register(body: ResgisterBodyType) {
    try {
      // tạo verification code và kiểm tra ...
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeofVerificationCode.REGISTER,
      })

      // lấy ra role id, role đc mặc định sãn là client || còn có seller và admin
      const clientRoleId = await this.rolesService.getClientRoleId()

      // hash password
      const hashedPassword = await this.hashingService.hash(body.password)

      // desttructuring, loại bỏ  confirmPassword, code
      const { confirmPassword, code, ...restBody } = body

      // spread operator để trải dữ liệu ra
      const userData = {
        ...restBody,
        roleId: clientRoleId,
        password: hashedPassword,
      }

      // tạo user
      const user = await this.authRespository.createUser(userData)

      // xóa otp code vừa đăng ký để an toàn
      await this.authRespository.deleleVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeofVerificationCode.REGISTER,
        },
      })

      return user
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ])
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    try {
      const user = await this.sharedUserRepository.findUnique({ email: body.email })

      if (user && body.type === TypeofVerificationCode.REGISTER) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ])
      }

      if (!user && body.type === TypeofVerificationCode.FORGOT_PASSWORD) {
        throw new UnprocessableEntityException([
          {
            message: 'Không tìm thấy email',
            path: 'email',
          },
        ])
      }

      // gernerate OTP 6 số ngẫu nhiên
      const code = generateOTP()

      // tạo verification code với hạn là 5m
      await this.authRespository.createVerification({
        email: body.email,
        code,
        type: body.type,
        expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
      })

      // Gửi mã otp
      const { error } = await this.sendEmail.sendEmail({ email: body.email, code: code })

      if (error) {
        throw new UnprocessableEntityException([
          {
            message: 'Gửi mã OTP thất bại',
            path: 'code',
          },
        ])
      }

      return {
        message: 'Gửi mã OTP thành công',
      }
    } catch (error) {
      console.error('[AuthService:SendOTP]', error)
      throw error
    }
  }

  async login(body: LoginBodyDTO & { ip: string; userAgent: string }) {
    // kiểm tra email có tồn tại
    const user = await this.authRespository.findUniqueUserIncludeRole({
      email: body.email,
    })

    if (!user) {
      throw new UnauthorizedException('Email không tồn tại')
    }

    // check password có đúng không
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)

    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'password is incorrect',
        },
      ])
    }

    // lưu userId, địa chỉ ip, userAgent là kiểu mo tả thiết bị của bạn đang sử dụng phần mềm nào ....
    const device = await this.authRespository.createDevice({
      userId: user.id,
      ip: body.ip,
      userAgent: body.userAgent,
    })

    // tạo ra accesstoken và refreshtoken
    const tokens = await this.generateToken({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })

    return tokens
  }

  async generateToken(payload: AccessTokenPayLoadCreate) {
    // dùng promise. all để chạy 2 cái cùng lúc ko cần dùng await
    const [accessToken, refreshToken] = await Promise.all([
      // tạo accesstoken
      this.tokenService.signAccessToken({
        userId: payload.userId,
        deviceId: payload.deviceId,
        roleId: payload.roleId,
        roleName: payload.roleName,
      }),

      // tạo refreshtoken
      this.tokenService.signRefeshToken({ userId: payload.userId }),
    ])

    // kiểm tra refresh token có hợp lệ không
    const decodedRefrestoken = await this.tokenService.verifyRefreshToken(refreshToken)

    // tạo lại refresh token
    await this.authRespository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decodedRefrestoken.exp * 1000),
      deviceId: payload.deviceId,
    })

    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, ip, userAgent }: RefreshTokenBodyDTO & { ip: string; userAgent: string }) {
    try {
      // kiển tra refreshToken để kiểm tra hợp lệ và lấy ra userId
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // kiển tra refreshToken tồn tại trong database ko
      const ref = await this.authRespository.findUniqueRefreshTokenInlcudeUserRole({
        token: refreshToken,
      })

      // nếu token ko tồn tại =>> nó đã bị revoked hoặc đánh cắp
      if (!ref) {
        throw new UnauthorizedException('Refresh token dẫ bị thu hồi')
      }

      const device = await this.authRespository.findDeviceById(ref.deviceId)

      if (device.ip !== ip || device.userAgent !== userAgent) {
        // nếu khác IP hoặc UA, nghi ngờ bị đánh cắp
        // có lẽ phải là gửi email khi có người đnagw nhập đến nếu không cùng địa chỉ ip
        await this.authRespository.revokeAllRefreshTokens(ref.userId)
        throw new UnauthorizedException('Phát hiện thiết bị lạ, vui lòng đăng nhập lại')
      }
      // lấy thông tin deviceId , roleId, rolName
      const {
        deviceId,
        user: { roleId, name: roleName },
      } = ref

      // update device
      await this.authRespository.updateDevice(deviceId, {
        ip,
        userAgent,
      })

      // xóa đi refresh token cữ nên mới có lỗi trễn
      await this.authRespository.deleteRefreshToken({
        token: refreshToken,
      })

      const tokens = await this.generateToken({
        userId,
        deviceId,
        roleId,
        roleName,
      })
      return tokens
    } catch (error) {
      console.error('[AuthService:RefreshToken]', error)
      throw error
    }
  }

  async logout(refreshToken: string) {
    try {
      // kiển tra token có đúng ko
      await this.tokenService.verifyRefreshToken(refreshToken)

      // kiển tra token có trong db ko
      await this.authRespository.findUniqueRefreshTokenInlcudeUserRole({ token: refreshToken })

      // xóa refreshToekn
      const ref = await this.authRespository.deleteRefreshToken({
        token: refreshToken,
      })

      // cập nhật lại device
      await this.authRespository.updateDevice(ref.deviceId, {
        isActive: false,
      })

      return { message: 'Logout successful' }
    } catch (error) {
      // refeshtoken bị đánh cắp
      if (isRecordNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token đã đc sử dụng')
      }
      throw new UnauthorizedException()
    }
  }

  async forgotPassword(body: ForgotPasswordType) {
    try {
      // kiểm tra email có tồn tại không
      const existedEmail = await this.authRespository.findUniqueUserIncludeRole({ email: body.email })

      if (!existedEmail) {
        throw new UnauthorizedException('Email không tồn tại')
      }

      //  tạo code
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeofVerificationCode.FORGOT_PASSWORD,
      })

      // hash password
      const hashedPassword = await this.hashingService.hash(body.newPassword)

      // update password
      await this.authRespository.updateUser(
        {
          id: existedEmail.id,
        },
        { password: hashedPassword },
      )

      // xóa Verification code sau khi đổi pass phòng ngừa có người dùng chính pass đó trong thời gian còn lại để đổi nữa
      await this.authRespository.deleleVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeofVerificationCode.FORGOT_PASSWORD,
        },
      })

      return {
        message: 'Thay đổi password thành công',
      }
    } catch (error) {
      console.error('[AuthService:ForgotPassword]', error)
      throw error
    }
  }
}
