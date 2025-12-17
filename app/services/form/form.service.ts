import type { FormAnswer, Prisma } from 'generated/prisma/client'
import { PAGINATION_DEFAULTS } from '~/core/constant'
import type { PaginationParams } from '~/core/editor/types'
import { prisma } from '~/db'
import { type CreateFormSchema, type UpdateFormThankYouPageSchema } from '~/validation/form'

export const getPaginatedForms = async (userId: string, q: string) => {
  const totalItems = await prisma.form.count({
    where: {
      creatorId: userId,
      title: {
        contains: q,
        mode: 'insensitive',
      },
    },
  })
  const totalPages = Math.ceil(totalItems / PAGINATION_DEFAULTS.TAKE)
  return {
    totalItems: totalItems,
    totalPages,
  }
}

export const getUserForms = async (userId: string, q: string, pagination?: PaginationParams) => {
  const take = pagination?.take ?? PAGINATION_DEFAULTS.TAKE
  const page = pagination?.page ?? PAGINATION_DEFAULTS.PAGE
  const skip = (page - 1) * take

  const whereClause: Prisma.FormFindManyArgs = {
    where: {
      creatorId: userId,
      title: {
        contains: q,
        mode: 'insensitive',
      },
    },
    take,
    skip,
    orderBy: {
      createdAt: 'desc',
    },
  }

  const paginationInfo = await getPaginatedForms(userId, q)
  const forms = await prisma.form.findMany(whereClause)

  return {
    forms,
    pagination: {
      ...paginationInfo,
      currentPage: page,
      perPage: take,
    },
  }
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

export const countFormSubmissions = async (formId: string) => {
  return await prisma.formSubmission.count({
    where: {
      formId,
    },
  })
}

export const getFormPage = async (pageId: string, formId: string, isPreview = false) => {
  const isPublishedOnly = !isPreview
    ? ({
        publishedAt: {
          not: null,
        },
      } as Prisma.FormWhereInput)
    : {}

  return await prisma.page.findFirst({
    where: {
      pageId,
      formId,
      form: isPublishedOnly,
    },
    include: {
      form: {
        select: {
          publishedAt: true,
          pagesTotal: true,
          theme: true,
          pages: {
            select: {
              pageId: true,
              pageNumber: true,
            },
          },
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
    select: {
      pageId: true,
    },
  })
}

export const updateFormThankYouPage = async ({
  formId,
  title,
  description,
}: UpdateFormThankYouPageSchema) => {
  return await prisma.form.update({
    where: { formId },
    data: {
      finalTitle: title,
      finalDescription: description,
    },
  })
}

export const createFormAnswerWithFieldAnswers = async ({
  formId,
  pageId,
  participantId,
  fieldAnswers,
}: {
  formId: string
  pageId: string
  participantId: string
  fieldAnswers: Prisma.FieldAnswerCreateManyFormAnswerInput[]
}) => {
  await prisma.formAnswer
    .create({
      data: {
        pageId,
        participantId,
        formId,
        fieldAnswers: {
          createMany: {
            data: fieldAnswers,
          },
        },
      },
    })
    .catch((error) => {
      console.error('Error creating form answer with field answers:', error)
      throw error
    })
}

export const getFormAnswersForParticipant = async (formId: string, participantId: string) => {
  return await prisma.formAnswer.findMany({
    where: {
      formId,
      participantId,
    },
  })
}

export const createFormSubmission = async (
  formId: string,
  participantId: string,
  formAnswers: FormAnswer[],
) => {
  return await prisma.formSubmission.create({
    data: {
      formId,
      participantId,
      formAnswers: {
        connect: formAnswers.map((fa) => ({ id: fa.id })),
      },
    },
  })
}

export const checkExistingFormSubmission = async (formId: string, participantId: string) => {
  return await prisma.formSubmission.findFirst({
    where: {
      formId,
      participantId,
    },
  })
}

export const getThankYouPageData = async (submissionId: string) => {
  return await prisma.formSubmission.findUniqueOrThrow({
    where: {
      submissionId,
    },
    select: {
      form: {
        select: {
          finalTitle: true,
          finalDescription: true,
          theme: true,
        },
      },
    },
  })
}
