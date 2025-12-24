import { redirect } from 'react-router'
import type { FormDefaultType } from '~/core/editor/types'
import { errorResponse } from '~/lib/response'
import { formatFieldAnswers } from '~/lib/utils'
import { ROUTES } from '~/routes'
import {
  checkExistingFormPageAnswer,
  checkExistingFormSubmission,
  createFormAnswerWithFieldAnswers,
  createFormSubmission,
  getFormAnswersForParticipant,
  getFormPage,
  getNextFormPage,
} from '~/services/form/form.service'
import { buildZodSchema, defaultFormPageFields } from '~/validation/form'
import type { Route } from './+types/submissions.submit'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const obj = {
    formId: formData.get('formId'),
    pageId: formData.get('pageId'),
    participantId: formData.get('participantId'),
  }

  const { formId, pageId, participantId } = defaultFormPageFields.parse(obj)

  // do not allow resubmissions on page AND form levels - block submission if either exists
  const [existingFormSubmission, existingFormPageAnswer] = await Promise.all([
    checkExistingFormSubmission(formId, participantId),
    checkExistingFormPageAnswer(pageId, participantId),
  ])

  if (existingFormSubmission) {
    throw new Error('Form submission already exists for this participant')
  }

  if (existingFormPageAnswer) {
    throw new Error('Form answer for this page already exists for this participant')
  }

  const page = await getFormPage(pageId, formId)
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

  await createFormAnswerWithFieldAnswers({
    formId,
    pageId,
    participantId,
    fieldAnswers: fieldAnswersToCreate,
  })

  if (page.pageNumber !== page.form.pagesTotal) {
    const nextPage = await getNextFormPage(page.formId, page.pageNumber)
    if (!nextPage) {
      throw new Error('Next page not found')
    }

    throw redirect(ROUTES.FORM_PAGE(formId, nextPage.pageId, participantId))
  } else {
    //last page
    const formAnswers = await getFormAnswersForParticipant(formId, participantId)
    const submission = await createFormSubmission(formId, participantId, formAnswers)

    throw redirect(ROUTES.THANK_YOU(submission.submissionId))
  }
}
