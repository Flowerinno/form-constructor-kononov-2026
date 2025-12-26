import type { Session } from 'generated/prisma/client'

export type UserSession =
  | (Session & {
      user: {
        userId: string
        email: string
        name: string | null
      }
    })
  | null
