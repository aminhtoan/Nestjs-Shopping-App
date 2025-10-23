import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import ms, { type StringValue } from 'ms'

export function isUniqueConstraintError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isRecordNotFoundError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}