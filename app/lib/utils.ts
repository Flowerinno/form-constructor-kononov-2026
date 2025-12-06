import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAuthLink(token: string) {
  return `${process.env.APP_URL}/auth?otp=${token}`
}
