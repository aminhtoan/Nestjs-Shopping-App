import { extend } from 'zod/mini'
import {
  LoginBodySchema,
  ResgisterBodySchema,
  ResgisterResSchema,
  SendOTPBodySchema,
  LoginResSchema,
  RefreshTokenSchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  LogoutBodySchema,
  GoogleAuthStateSchema,
  GetAuthorizationUrlResSchema,
} from './auth.model'
import { createZodDto } from 'nestjs-zod'

// cái này là body ý nghĩa là cái phần mày user sẽ nhập vào, có số luọng cụ thể
export class RegisterBodyDTO extends createZodDto(ResgisterBodySchema) {}

// cái này là cái form hoàn chỉnh của schema phản hổi về và đã đc ẩn những cái cần ẩm
export class RegisterResDTO extends createZodDto(ResgisterResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}

export class GoogleAuthStateDTO extends createZodDto(GoogleAuthStateSchema) {}

export class GetAuthorizationUrlResDTO extends createZodDto(GetAuthorizationUrlResSchema) {}
