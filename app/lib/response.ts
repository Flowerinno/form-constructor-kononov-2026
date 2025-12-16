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

export type SuccessResponse<T> = {
  data: T
  error: null
}

type ErrorObject = { message: string; name: string; map: Record<string, string>[] }
export type ErrorResponse = {
  data: null
  error: ErrorObject
}

export const errorResponse = (error: unknown): ErrorResponse => {
  if (error instanceof ZodError) {
    return {
      error: {
        message: 'Validation Error',
        name: 'ZodError',
        map: error.issues.map((issue) => ({ id: issue.path.join('.'), message: issue.message })),
      },
      data: null,
    }
  }

  if (error instanceof UserError || error instanceof AuthError || error instanceof AppError) {
    return { error: { message: error.message, name: error.name, map: [] }, data: null }
  }

  if (error instanceof Error) {
    return { error: { message: error.message, name: error.name || 'Error', map: [] }, data: null }
  }

  return {
    error: { message: 'An unexpected and unknown error occurred.', name: 'UnknownError', map: [] },
    data: null,
  }
}

export const customResponse = <T>(payload: T): SuccessResponse<T> => {
  return { data: payload, error: null }
}

export const isRedirectResponse = (error: unknown) => {
  if (error instanceof Response) {
    throw error
  }
}
