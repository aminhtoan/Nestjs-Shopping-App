import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import envConfig from '../config'
import {
  AccessTokenPayLoad,
  AccessTokenPayLoadCreate,
  RefreshTokenPayLoad,
  RefreshTokenPayLoadCreate,
} from '../types/jwt.type'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: AccessTokenPayLoadCreate) {
    return this.jwtService.sign(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    } as any)
  }

  signRefeshToken(payload: RefreshTokenPayLoadCreate) {
    return this.jwtService.sign(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    } as any)
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayLoad> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayLoad> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }
}
