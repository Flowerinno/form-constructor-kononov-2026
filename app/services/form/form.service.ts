import type { PageAnswer, Prisma } from 'generated/prisma/client'
import { PAGINATION_DEFAULTS } from '~/core/constant'
import type { PaginationParams } from '~/core/editor/types'
import { prisma } from '~/db'
import { logError } from '~/lib/logger'
import { type CreateFormSchema, type UpdateFormThankYouPageSchema } from '~/validation/form'
import type { QueryParams } from '~/validation/general'

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

export const getFormPage = async (
  pageNumber: number,
  formId: string,
  isPreview = false,
  participantId: string | null = null,
) => {
  const isPublishedOnly = !isPreview
    ? ({
        publishedAt: {
          not: null,
        },
      } as Prisma.FormWhereInput)
    : {}

  return await prisma.page.findFirst({
    where: {
      pageNumber,
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
      pageAnswers: {
        where: {
          participantId: participantId ?? undefined,
        },
        include: {
          fieldAnswers: true,
        },
      },
    },
  })
}
export type ReturnTypeGetFormPage = Awaited<ReturnType<typeof getFormPage>>

export const getDashboardFormPage = async (pageId: string, formId: string, isPreview = false) => {
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
      pageNumber: true,
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

export const createOrUpdatePageAnswerWithFieldAnswers = async ({
  pageId,
  participantId,
  fieldAnswers,
  pageAnswerId,
}: {
  pageId: string
  participantId: string
  fieldAnswers: Prisma.FieldAnswerCreateManyPageAnswerInput[]
  pageAnswerId: string | null
}) => {
  await prisma.pageAnswer
    .upsert({
      where: {
        answerId: pageAnswerId ?? '',
      },
      create: {
        pageId,
        referencePageId: pageId,
        participantId,
        fieldAnswers: {
          createMany: {
            data: fieldAnswers,
          },
        },
      },
      update: {
        fieldAnswers: {
          updateMany: fieldAnswers.map((fa) => ({
            where: {
              fieldId: fa.fieldId,
            },
            data: {
              answer: fa.answer,
            },
          })),
        },
      },
    })
    .catch((error) => {
      logError({
        message: 'Error in createOrUpdatePageAnswerWithFieldAnswers',
        error,
        meta: { pageId, participantId, pageAnswerId },
      })
      throw error
    })
}

export const getFormAnswersForParticipant = async (formId: string, participantId: string) => {
  return await prisma.pageAnswer.findMany({
    where: {
      participantId,
      page: {
        formId,
      },
    },
  })
}

export const getLatestFormAnswerForParticipant = async (formId: string, participantId: string) => {
  return await prisma.pageAnswer.findFirst({
    where: {
      page: {
        formId,
      },
      participantId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      page: {
        select: {
          pageNumber: true,
        },
      },
    },
  })
}

export const createFormSubmission = async (
  formId: string,
  participantId: string,
  pageAnswers: PageAnswer[],
) => {
  return await prisma.$transaction(async (tx) => {
    const submission = await tx.formSubmission.create({
      data: {
        formId,
        participantId,
        pageAnswers: {
          connect: pageAnswers.map((pa) => ({ id: pa.id })),
        },
      },
    })

    await tx.participant.update({
      where: { participantId },
      data: { completedAt: new Date() },
    })

    return submission
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

export const countNumberOfPageAnswers = async (pageId: string, participantId: string) => {
  return await prisma.pageAnswer.count({
    where: {
      pageId,
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

export const getFormSubmissions = async ({
  formId,
  queryParams,
}: {
  formId: string
  queryParams: QueryParams
}) => {
  const formSubmissions = await prisma.formSubmission.findMany({
    where: {
      formId,
      createdAt: queryParams.date
        ? {
            gte: new Date(`${queryParams.date}T00:00:00.000Z`),
            lte: new Date(`${queryParams.date}T23:59:59.999Z`),
          }
        : undefined,
      OR: [
        {
          participant: {
            email: {
              contains: queryParams.q ?? undefined,
              mode: 'insensitive',
            },
          },
        },
        {
          submissionId: {
            equals: queryParams.q ?? undefined,
            mode: 'insensitive',
          },
        },
      ],
    },
    skip: (queryParams.page - 1) * PAGINATION_DEFAULTS.TAKE,
    take: PAGINATION_DEFAULTS.TAKE,
    orderBy: [
      {
        participant: {
          email: queryParams.sortBy === 'participant' ? queryParams.sortDirection : undefined,
        },
      },
      {
        createdAt:
          queryParams.sortBy === 'createdAt' || !queryParams.sortBy
            ? queryParams.sortDirection
            : undefined,
      },
    ],
    include: {
      participant: {
        select: {
          email: true,
          participantId: true,
          completedAt: true,
        },
      },
      pageAnswers: {
        select: {
          id: true,
        },
      },
    },
  })

  const submissionsCount = await prisma.formSubmission.count({
    where: { formId },
  })

  const paginationObject = {
    currentPage: queryParams.page,
    perPage: PAGINATION_DEFAULTS.TAKE,
    totalItems: submissionsCount,
    totalPages: Math.ceil(submissionsCount / PAGINATION_DEFAULTS.TAKE),
  }

  return {
    submissionsCount,
    formSubmissions,
    pagination: paginationObject,
  }
}

export const getUniqueFormSubmission = async (submissionId: string) => {
  return await prisma.formSubmission.findUniqueOrThrow({
    where: { submissionId },
    include: {
      participant: {
        select: {
          participantId: true,
          email: true,
        },
      },
      pageAnswers: {
        select: {
          referencePageId: true,
          answerId: true,
          pageId: true,
          page: {
            select: {
              pageId: true,
              pageNumber: true,
              title: true,
              pageFields: true,
            },
          },
          fieldAnswers: {
            select: {
              fieldId: true,
              answer: true,
              type: true,
              pageAnswerId: true,
              id: true,
            },
          },
        },
      },
    },
  })
}

export const calculateFormConversionRate = async (formId: string) => {
  const stats = await prisma.participant.groupBy({
    by: ['formId'],
    where: { formId },
    _count: {
      participantId: true,
      completedAt: true,
    },
  })

  const totalStarts = stats[0]?._count.participantId ?? 0
  const completions = stats[0]?._count.completedAt ?? 0
  return totalStarts > 0 ? (completions / totalStarts) * 100 : 0
}
