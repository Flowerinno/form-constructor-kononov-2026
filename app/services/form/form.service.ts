import { prisma } from '~/db'
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

export const getFormById = async (formId: string) => {
  return await prisma.form.findUnique({
    where: {
      formId,
    },
    include: {
      pages: {
        orderBy: {
          pageNumber: 'asc',
        },
      },
    },
  })
}

export const getFormPage = async (pageId: string, formId: string) => {
  return await prisma.page.findFirst({
    where: {
      pageId,
      formId,
    },
    include: {
      form: {
        select: {
          pagesTotal: true,
          theme: true,
        },
      },
    },
  })
}

export const createFormPage = async (formId: string) => {
  return prisma.$transaction(async (ts) => {
    const pagesCount = await ts.page.count({
      where: { formId },
    })

    return await ts.form.update({
      where: { formId },
      data: {
        pagesTotal: {
          increment: 1,
        },
        pages: {
          create: {
            pageNumber: pagesCount === 0 ? 1 : pagesCount + 1,
          },
        },
      },
    })
  })
}

export const toggleFormPublish = async (formId: string) => {
  const form = await prisma.form.findUniqueOrThrow({
    where: { formId },
    include: {
      pages: {
        select: {
          pageFields: true,
        },
      },
    },
  })

  if (!form.publishedAt && form.pagesTotal === 0) {
    throw new Error('Cannot publish a form with no pages')
  }

  if (!form.publishedAt && form.pages.some((page) => !page.pageFields)) {
    throw new Error('Cannot publish a form with empty pages')
  }

  const publishedAt = form.publishedAt ? null : new Date()
  return await prisma.form.update({
    where: { formId },
    data: {
      publishedAt,
    },
    select: {
      publishedAt: true,
    },
  })
}

// form flow

export const getFormFirstPage = async (formId: string) => {
  return await prisma.page.findFirst({
    where: {
      formId,
      pageNumber: 1,
    },
  })
}

export const getNextFormPage = async (formId: string, currentPageNumber: number) => {
  return await prisma.page.findFirst({
    where: {
      formId,
      pageNumber: currentPageNumber + 1,
    },
  })
}
