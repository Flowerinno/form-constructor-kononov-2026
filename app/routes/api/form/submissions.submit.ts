import { redirect } from 'react-router'
import type { FormDefaultType } from '~/core/editor/types'
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

  if (intent === 'prev') {
    const currentPage = await getFormPage(pageNumber, formId)
    if (!currentPage) {
      throw new Error('Current page not found')
    }

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

  const page = await getFormPage(pageNumber, formId)
  if (!page) {
    throw new Error('Page not found')
  }

  const pageFields = JSON.parse(page.pageFields as string) as FormDefaultType
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

  if (page.pageNumber !== page.form.pagesTotal) {
    const nextPage = await getNextFormPage(page.formId, page.pageNumber)
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
