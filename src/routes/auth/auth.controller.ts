import { Body, Controller, HttpCode, HttpStatus, Ip, Post, Req, SerializeOptions } from '@nestjs/common'
import { LoginBodyDTO, RegisterBodyDTO, RegisterResDTO, SendOTPBodyDTO } from './auth.dto'
import { AuthService } from './auth.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { IP } from 'src/shared/decorators/ip.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('otp')
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }

  @Post('login')
  login(@Body() body: LoginBodyDTO, @IP() ip: string, @UserAgent() userAgent: string) {
    return this.authService.login({ ...body, ip, userAgent })
  }

  // @Post('refresh-token')
  // // @Auth([AuthType.Bearer, AuthType.Apikey], { condition: ConditionGuard.Or })
  // @HttpCode(HttpStatus.OK)
  // refreshToken(@Body() body: RefreshTokenDTO) {
  //   return this.authService.refreshToken(body.refreshToken)
  // }

  // @Post('logout')
  // logout(@Body() body: LogoutDTO) {
  //   return this.authService.logout(body.refreshToken)
  // }
}
