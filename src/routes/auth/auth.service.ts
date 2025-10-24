import { ResgisterBodyType, SendOTPBodyType } from './auth.model'
import { TokenService } from './../../shared/services/token.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashinngService } from './../../shared/services/hashinng.service'
import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/extension'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { generateOTP, isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { RolesService } from './roles.service'
import { AuthRespository } from './auth.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import envConfig from 'src/shared/config'
import ms from 'ms'
import { type StringValue } from 'ms'
import { TypeofVerificationCodeType } from 'src/shared/constants/auth.constant'
import { SendEmail } from 'src/shared/services/email.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashinngService: HashinngService,
    private readonly authRespository: AuthRespository,
    private readonly rolesService: RolesService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sendEmail: SendEmail,
  ) {}

  async register(body: ResgisterBodyType) {
    try {
      const verificationCode = await this.authRespository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeofVerificationCodeType.REGISTER,
      })

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP không hợp lệ',
            path: 'code',
          },
        ])
      }
      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP đã hết hạn',
            path: 'code',
          },
        ])
      }

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashinngService.hash(body.password)
      const { confirmPassword, code, ...restBody } = body
      const userData = {
        ...restBody,
        roleId: clientRoleId, // Add the role ID
        password: hashedPassword, // Override the plain password with the hashed one
      }

      const user = await this.authRespository.createUser(userData)
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
      if (user) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ])
      }

      const code = generateOTP()
      const verificationCode = await this.authRespository.createVerification({
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
      return verificationCode
    } catch (error) {
      console.error('Send OTP Error:', error)
      throw error
    }
  }
  // async login(body: LoginDTO) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: {
  //       email: body.email,
  //     },
  //   })

  //   if (!user) {
  //     throw new UnauthorizedException('Email not exist')
  //   }

  //   const isPasswordMatch = await this.hashinngService.compare(body.password, user.password)
  //   if (!isPasswordMatch) {
  //     throw new UnprocessableEntityException([
  //       {
  //         field: 'password',
  //         error: 'password is incorrect',
  //       },
  //     ])
  //   }

  //   const tokens = await this.generateToken({ userId: user.id })
  //   return tokens
  // }

  // async generateToken(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefeshToken(payload),
  //   ])

  //   const decodedRefrestoken = await this.tokenService.verifyRefreshToken(refreshToken)

  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       expiresAt: new Date(decodedRefrestoken.exp * 1000),
  //     },
  //   })
  //   return { accessToken, refreshToken }
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // kiển tra token có đúng ko
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

  //     // kiển tra token có trong db ko
  //     await this.prismaService.refreshToken.findUniqueOrThrow({
  //       where: { token: refreshToken },
  //     })

  //     await this.prismaService.refreshToken.delete({
  //       where: { token: refreshToken },
  //     })

  //     return await this.generateToken({ userId })
  //   } catch (error) {
  //     // refeshtoken bị đánh cắp
  //     if (isRecordNotFoundError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException('Invalid refresh token')
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // kiển tra token có đúng ko
  //     await this.tokenService.verifyRefreshToken(refreshToken)

  //     // kiển tra token có trong db ko
  //     await this.prismaService.refreshToken.findUniqueOrThrow({
  //       where: { token: refreshToken },
  //     })

  //     await this.prismaService.refreshToken.delete({
  //       where: { token: refreshToken },
  //     })
  //     return { message: 'Logout successful' }
  //   } catch (error) {
  //     // refeshtoken bị đánh cắp
  //     if (isRecordNotFoundError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException('Invalid refresh token')
  //   }
  // }
}
