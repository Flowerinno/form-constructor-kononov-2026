import { redirect } from 'react-router'
import { REDIS_KEYS, TIME } from '~/core/constant'
import type { FormDefaultType } from '~/core/editor/types'
import { getRedisEntry, setRedisEntry } from '~/lib/redis'
import { errorResponse } from '~/lib/response'
import { formatFieldAnswers } from '~/lib/utils'
import { ROUTES } from '~/routes'
import {
  checkExistingFormSubmission,
  countNumberOfPageAnswers,
  createFormSubmission,
  createOrUpdatePageAnswerWithFieldAnswers,
  getFormAnswersForParticipant,
  getFormPage,
  getNextFormPage,
  type ReturnTypeGetFormPage,
} from '~/services/form/form.service'
import { buildZodSchema, defaultFormPageFieldsWithNumber } from '~/validation/form'
import type { Route } from './+types/submissions.submit'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const obj = {
    formId: formData.get('formId'),
    pageNumber: Number(formData.get('pageNumber')),
    pageId: formData.get('pageId'),
    participantId: formData.get('participantId'),
    intent: formData.get('intent'),
    pageAnswerId: formData.get('pageAnswerId'),
  }

  const { formId, pageNumber, participantId, pageId, intent, pageAnswerId } =
    defaultFormPageFieldsWithNumber.parse(obj)

  let currentPage: ReturnTypeGetFormPage = null
  const cachedPage = await getRedisEntry<ReturnTypeGetFormPage>(
    REDIS_KEYS.FORM_PAGE_BY_NUMBER(formId, pageNumber),
  )

  if (cachedPage) {
    currentPage = cachedPage
  } else {
    currentPage = await getFormPage(pageNumber, formId)
    await setRedisEntry(
      REDIS_KEYS.FORM_PAGE_BY_NUMBER(formId, pageNumber),
      currentPage,
      TIME.ONE_DAY_SECONDS,
    )
  }

  if (!currentPage) {
    throw new Error('Current page not found')
  }

  if (intent === 'prev') {
    const prevPage = await getNextFormPage(formId, currentPage.pageNumber - 2)
    if (!prevPage) {
      throw new Error('Previous page not found')
    }

    throw redirect(ROUTES.FORM_PAGE(formId, prevPage.pageNumber, participantId))
  }

  const existingFormSubmission = await checkExistingFormSubmission(formId, participantId)
  if (existingFormSubmission) {
    throw new Error('Form submission already exists for this participant')
  }

  const pageAnswerCount = await countNumberOfPageAnswers(pageId, participantId)
  if (pageAnswerCount > 5) {
    throw new Error('Spam detected: Too many attempts to submit answers for this page')
  }

  const pageFields = JSON.parse(currentPage.pageFields as string) as FormDefaultType
  const schema = await buildZodSchema(pageFields, { formId, pageId, participantId })

  const { success, error, data } = schema.safeParse(Object.fromEntries(formData))

  if (!success) {
    return errorResponse(error)
  }

  const fieldAnswersToCreate = formatFieldAnswers({
    data,
    pageFields,
    participantId,
  })

  await createOrUpdatePageAnswerWithFieldAnswers({
    pageId,
    participantId,
    fieldAnswers: fieldAnswersToCreate,
    pageAnswerId,
  })

  if (currentPage.pageNumber !== currentPage.form.pagesTotal) {
    const nextPage = await getNextFormPage(currentPage.formId, currentPage.pageNumber)
    if (!nextPage) {
      throw new Error('Next page not found')
    }

    throw redirect(ROUTES.FORM_PAGE(formId, nextPage.pageNumber, participantId))
  } else {
    //last page
    const formAnswers = await getFormAnswersForParticipant(formId, participantId)
    const submission = await createFormSubmission(formId, participantId, formAnswers)

    throw redirect(ROUTES.THANK_YOU(submission.submissionId))
  }
}
