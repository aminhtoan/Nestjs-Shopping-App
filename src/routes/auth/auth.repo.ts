import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ResgisterBodyType, UserType, VerificationCodeType } from './auth.model'

@Injectable()
export class AuthRespository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<ResgisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createVerification(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }
}
