import crypto from 'crypto'
import type { Session } from 'react-router'
import { TIME } from '~/core/constant'
import { prisma } from '~/db'
import { checkRedisUserSession, setRedisEntry } from '~/lib/redis'
import type { UserSession } from './types'

export const getUserSession = async (sessionId: string | undefined): Promise<UserSession> => {
  if (!sessionId) {
    return null
  }

  const cachedSession = await checkRedisUserSession(sessionId)
  if (cachedSession) {
    return cachedSession
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
      expiresAt: {
        gt: new Date(),
      },
      expiredAt: null,
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          userId: true,
        },
      },
    },
  })

  if (session) {
    await setRedisEntry(`session:${sessionId}`, session, TIME.ONE_WEEK / 1000)
    return session
  }

  return null
}

export const destroyUserSession = async (session: Session) => {
  await prisma.session.update({
    where: {
      id: session.get('sessionId'),
    },
    data: {
      expiredAt: new Date(),
    },
  })
}

export const createUserSession = async (userId: string, isNewUser: boolean | null = false) => {
  await invalidateUserSessions(userId)

  const session = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + TIME.ONE_WEEK),
    },
    include: {
      user: {
        select: {
          userId: true,
          email: true,
          name: true,
        },
      },
    },
  })

  if (isNewUser) {
    await prisma.user.update({
      where: { userId },
      data: {
        verifiedAt: new Date(),
      },
    })
  }

  return session
}

export const invalidateUserSessions = async (userId: string) => {
  await prisma.session.updateMany({
    where: {
      userId,
      expiredAt: null,
    },
    data: {
      expiredAt: new Date(),
    },
  })
}
