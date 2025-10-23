import { Body, Controller, HttpCode, HttpStatus, Post, SerializeOptions } from '@nestjs/common'
import { RegisterBodyDTO, RegisterResDTO, SendOTPBodyDTO } from './auth.dto'
import { AuthService } from './auth.service'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('otp')
  // @ZodSerializerDto(RegisterResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }
  // @Post('login')
  // login(@Body() body: LoginDTO) {
  //   return this.authService.login(body)
  // }

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
