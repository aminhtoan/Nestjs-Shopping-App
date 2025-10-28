import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './roles.service'
import { AuthRespository } from './auth.repo'
import { GoogleService } from './google.service'

@Module({
  providers: [AuthService, RolesService, AuthRespository, GoogleService],
  controllers: [AuthController],
})
export class AuthModule {}
