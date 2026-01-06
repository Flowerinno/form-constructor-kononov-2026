import { clsx, type ClassValue } from 'clsx'
import type { Prisma } from 'generated/prisma/client'
import { twMerge } from 'tailwind-merge'
import type { AppPaginationProps } from '~/components/app-ui/app-pagination'
import { FIELD_TYPE_MAP } from '~/core/constant'
import type { FormDefaultType, PaginationData } from '~/core/editor/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAuthLink(token: string, isNewUser = false) {
  return `${process.env.APP_URL}/auth?otp=${token}${isNewUser ? '&newUser=true' : ''}`
}

export function getPaginationData(pagination: PaginationData): AppPaginationProps | null {
  if (!pagination || pagination.totalPages === 0) {
    return null
  }

  const MAX_PAGE_LINKS = 5
  const halfMax = Math.floor(MAX_PAGE_LINKS / 2)
  let startPage = Math.max(1, pagination.currentPage - halfMax)
  let endPage = Math.min(pagination.totalPages, pagination.currentPage + halfMax)

  if (endPage - startPage + 1 < MAX_PAGE_LINKS) {
    startPage = Math.max(1, endPage - MAX_PAGE_LINKS + 1)
    endPage = Math.min(pagination.totalPages, startPage + MAX_PAGE_LINKS - 1)
  }

  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return {
    pageNumbers,
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage,
    hasPrevious: pagination.currentPage > 1,
    hasNext: pagination.currentPage < pagination.totalPages,
    startPage,
    endPage,
    generatePageLink: (page: number, location: Location) => {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('page', page.toString())
      return `${location.pathname}?${searchParams.toString()}`
    },
  }
}

export function formatAnswerDataToStore(answer: unknown) {
  if (answer === null || answer === undefined) {
    return ''
  }

  if (Array.isArray(answer)) {
    return answer.join(',')
  }

  return String(answer)
}

export function formatFieldAnswers({
  data,
  pageFields,
  participantId,
}: {
  data: Record<string, unknown>
  pageFields: FormDefaultType
  participantId: string
}) {
  const fieldAnswersToCreate: Prisma.FieldAnswerCreateManyPageAnswerInput[] = []
  for (const field of pageFields.content) {
    const type = FIELD_TYPE_MAP[field.type as keyof typeof FIELD_TYPE_MAP]

    if (!type) {
      continue
    }

    fieldAnswersToCreate.push({
      type: FIELD_TYPE_MAP[field.type as keyof typeof FIELD_TYPE_MAP],
      fieldId: field.props.id,
      answer: formatAnswerDataToStore(data[field.props.id]),
      participantId,
    })
  }

  return fieldAnswersToCreate
}

type FileNameParams = {
  formId: string
  pageId: string
  participantId: string
  fieldId: string
  isUpload?: boolean
}

export function getFilePrefix({
  formId,
  pageId,
  participantId,
  fieldId,
  isUpload = false,
}: FileNameParams) {
  return `${formId}-${pageId}-${participantId}-${fieldId}-${isUpload ? Date.now() : ''}`
}
