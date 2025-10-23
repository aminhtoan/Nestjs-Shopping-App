import z from 'zod'
import { UserStatus } from '../constants/auth.constant'

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
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type UserType = z.infer<typeof UserSchema>
