import { prisma } from '~/db.server'
import { logger } from '~/lib/logger'
import { AuthError } from '~/lib/response'

export const verifyOtp = async (token: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findUniqueOrThrow({
      where: {
        token,
        expiredAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    return verificationToken
  } catch (error) {
    logger.error(error, 'Error verifying OTP token')
    throw new AuthError('Invalid or expired OTP token')
  } finally {
    await invalidateOtp(token)
  }
}

export const invalidateOtp = async (token: string) => {
  return prisma.verificationToken.update({
    where: {
      token,
    },
    data: {
      expiredAt: new Date(),
    },
  })
}

export const checkExistingOtp = async (email: string) => {
  return await prisma.verificationToken.findFirst({
    where: {
      expiresAt: {
        gt: new Date(),
      },
      expiredAt: null,
      user: {
        email,
      },
    },
    select: {
      expiresAt: true,
    },
  })
}
