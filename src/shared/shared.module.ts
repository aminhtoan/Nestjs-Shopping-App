import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashinngService } from './services/hashinng.service'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { SharedUserRepository } from './repositories/shared-user.repo'

const sharedServices = [PrismaService, HashinngService, TokenService, SharedUserRepository]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [
    ...sharedServices,
    AccessTokenGuard, // 👈 thêm dòng này
    APIKeyGuard, // 👈 thêm dòng này
  ],
  imports: [JwtModule],
})
export class SharedModule {}
