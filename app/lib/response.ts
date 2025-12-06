import { ZodError } from 'zod'

export class UserError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserError'
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppError'
  }
}

type ErrorObject = { message: string; name?: string }

export const errorResponse = (error: unknown): { error: ErrorObject; data: null } => {
  if (error instanceof ZodError) {
    return { error: { message: 'Validation Error', name: 'ZodError' }, data: null }
  }

  if (error instanceof UserError || error instanceof AuthError || error instanceof AppError) {
    return { error: { message: error.message, name: error.name }, data: null }
  }

  if (error instanceof Error) {
    return { error: { message: error.message, name: error.name || 'Error' }, data: null }
  }

  return {
    error: { message: 'An unexpected and unknown error occurred.', name: 'UnknownError' },
    data: null,
  }
}

export const customResponse = <T>(data: T): { data: T; error: null } => {
  return { data, error: null }
}

export const isRedirectResponse = (error: unknown) => {
  if (error instanceof Response) {
    throw error
  }
}
