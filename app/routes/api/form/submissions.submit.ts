import { redirect } from 'react-router'
import type { FormDefaultType } from '~/core/editor/types'
import { errorResponse } from '~/lib/response'
import { formatFieldAnswers } from '~/lib/utils'
import { ROUTES } from '~/routes'
import {
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

  const page = await getFormPage(pageId, formId)

  if (!page) {
    throw new Error('Page not found')
  }

  const pageFields = JSON.parse(page.pageFields as string) as FormDefaultType
  const schema = buildZodSchema(pageFields)

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
