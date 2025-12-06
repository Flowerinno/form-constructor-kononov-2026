import crypto from 'crypto'
import type { Session } from 'react-router'
import { TIME } from '~/core/constant'
import { prisma } from '~/db.server'

export const getUserSession = async (sessionId: string | undefined) => {
  try {
    return await prisma.session.findUniqueOrThrow({
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
  } catch (error) {}
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

export const createUserSession = async (userId: string) => {
  await invalidateUserSessions(userId)

  const session = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + TIME.ONE_WEEK),
    },
    select: {
      id: true,
      user: {
        select: {
          userId: true,
          email: true,
          name: true,
        },
      },
    },
  })

  return {
    userId: session.user.userId,
    email: session.user.email,
    name: session.user.name,
    sessionId: session.id,
  }
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
