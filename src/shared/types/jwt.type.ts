export interface AccessTokenPayLoadCreate {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}

export interface AccessTokenPayLoad extends AccessTokenPayLoadCreate {
  iat: number
  exp: number
}

export interface RefreshTokenPayLoadCreate {
  userId: number
}

export interface RefreshTokenPayLoad extends RefreshTokenPayLoadCreate {
  iat: number
  exp: number
}
