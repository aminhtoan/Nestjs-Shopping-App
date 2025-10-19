import { LoggingInterceptor } from 'src/shared/interceptor/logging.interceptor'
import { LoginDTO, LoginrResDTO, LogoutDTO, RefreshTokenDTO, RegisterDTO, RegisterResDTO } from './auth.dto'
import { AuthService } from './auth.service'
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  register(@Body() body: RegisterDTO) {
    return this.authService.register(body)
  }

  @SerializeOptions({ type: LoginrResDTO })
  @Post('login')
  login(@Body() body: LoginDTO) {
    return this.authService.login(body)
  }

  @SerializeOptions({ type: RefreshTokenDTO })
  @Post('refresh-token')
  // @Auth([AuthType.Bearer, AuthType.Apikey], { condition: ConditionGuard.Or })
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenDTO) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @Post('logout')
  logout(@Body() body: LogoutDTO) {
    return this.authService.logout(body.refreshToken)
  }
}
