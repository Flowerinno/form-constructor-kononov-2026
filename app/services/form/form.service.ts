import { prisma } from '~/db.server'
import type { CreateFormSchema } from '~/validation/form'

export const getUserForms = async (userId: string) => {
  return await prisma.form.findMany({
    where: {
      creatorId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const removeUserForm = (userId: string, formId: string) => {
  return prisma.form.delete({
    where: {
      formId,
      creatorId: userId,
    },
  })
}

export const createUserForm = async (formData: CreateFormSchema, userId: string) => {
  return await prisma.form.create({
    data: {
      title: formData.title,
      description: formData.description,
      creatorId: userId,
    },
    select: {
      formId: true,
    },
  })
}

export const getFormById = async (formId: string, userId: string) => {
  return await prisma.form.findUnique({
    where: {
      formId,
      creatorId: userId,
    },
  })
}
