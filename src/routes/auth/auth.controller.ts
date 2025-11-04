import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Req, SerializeOptions } from '@nestjs/common'
import {
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
} from './auth.dto'
import { AuthService } from './auth.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { IP } from 'src/shared/decorators/ip.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { GoogleService } from './google.service'
import { Throttle } from '@nestjs/throttler'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('otp')
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDTO, @Ip() ip: string, @UserAgent() userAgent: string) {
    return this.authService.login({ ...body, ip, userAgent })
  }

  @Post('refresh-token')
  @ZodSerializerDto(RefreshTokenResDTO)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @Ip() ip: string, @UserAgent() userAgent: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      ip,
      userAgent,
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDto)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Get('google-link')
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getGoogleLink(@Ip() ip: string, @UserAgent() userAgent: string) {
    return this.googleService.getGoogleLink({
      ip,
      userAgent,
    })
  }
}
