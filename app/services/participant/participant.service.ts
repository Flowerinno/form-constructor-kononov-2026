import { prisma } from '~/db'

export const getFormParticipantByEmail = async (email: string, formId: string) => {
  return await prisma.participant.findFirst({
    where: {
      email,
      formId,
    },
    include: {
      formAnswers: true,
    },
  })
}

export const createFormParticipant = async (email: string, formId: string) => {
  return await prisma.participant.create({
    data: {
      email,
      formId,
    },
    include: {
      formAnswers: true,
    },
  })
}

export const getParticipantsByFormId = async (
  participantId: string,
  formId: string,
  orderBy: 'asc' | 'desc' = 'desc',
) => {
  return await prisma.participant.findMany({
    where: {
      participantId,
      formId,
    },
    orderBy: {
      createdAt: orderBy,
    },
  })
}
