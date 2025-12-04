import { prisma } from '~/db.server'

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
