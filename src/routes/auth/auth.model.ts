import { TypeofVerificationCodeType, UserStatus } from 'src/shared/constants/auth.constant'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9]+$/),
  phoneNumber: z.string().min(10).max(15),
  password: z.string().min(6).max(50),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// register
export const ResgisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(50),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const ResgisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

// Send OTP
export const VerificationCode = z.object({
  id: z.number(),
  email: z.string(),
  code: z.string(),
  type: z.enum(TypeofVerificationCodeType),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export const SendOTPBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict()

// Login
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const RefreshTokenResSchema = LoginResSchema

//device
export const DeiviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.coerce.date(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

// RefreshToken
export const RefreshTokenSchema = z.object({
  token: z.string().max(1000),
  userId: z.number().int(),
  deviceId: z.number().int(),
  expiresAt: z.date(),
  createdAt: z.date(),
})

// role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
})

export const LogoutBodySchema = RefreshTokenBodySchema

// google auth 2
export const GoogleAuthStateSchema = DeiviceSchema.pick({
  ip: true,
  userAgent: true,
})

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
})

export type RoleType = z.infer<typeof RoleSchema>
export type UserType = z.infer<typeof UserSchema>
export type ResgisterBodyType = z.infer<typeof ResgisterBodySchema>
export type ResgisterResType = z.infer<typeof ResgisterResSchema>
export type VerificationCodeType = z.infer<typeof VerificationCode>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefresTokenResType = LoginResType
export type DeiviceType = z.infer<typeof DeiviceSchema>
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type LogoutBodyType = RefreshTokenBodyType
export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>
export type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>
