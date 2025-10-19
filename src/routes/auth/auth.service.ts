import { TokenService } from './../../shared/services/token.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashinngService } from './../../shared/services/hashinng.service'
import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/extension'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { RolesService } from './roles.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashinngService: HashinngService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
  ) {}

  async register(body: any) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashinngService.hash(body.password)
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.number,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      })
      return user
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('User with this email already exists')
      }
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
