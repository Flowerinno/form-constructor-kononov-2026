import { EMAIL_TEMPLATES, TIME } from '~/core/constant'
import { prisma } from '~/db.server'
import type { SessionData } from '~/lib/session'
import { generateAuthLink } from '~/lib/utils'
import crypto from 'crypto'
import { sendEmail } from '../mail/mail.service'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function updateUser(id: number, data: { name: string }) {
  return await prisma.user.update({
    where: { id },
    data,
  })
}

export async function createUser(email: string) {
  return prisma.user.create({
    data: { email },
  })
}

export const signIn = async (email: string): Promise<SessionData> => {
  let user = await findUserByEmail(email)

  if (!user) {
    user = await createUser(email)
  }

  const { token } = await prisma.verificationToken.create({
    data: {
      expiresAt: new Date(Date.now() + TIME.TEN_MINUTES),
      token: crypto.randomBytes(32).toString('base64url'),
      userId: user.id,
    },
    select: { token: true },
  })

  console.log('Auth link:', generateAuthLink(token)) // mock email
  // await sendEmail(email, {
  //   subject: EMAIL_TEMPLATES.authLink.subject,
  //   html: EMAIL_TEMPLATES.authLink.html(generateAuthLink(token)),
  // })

  return {
    userId: user.userId,
    email: user.email,
    name: user?.name,
    sessionId: token,
  }
}
