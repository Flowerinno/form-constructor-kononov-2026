import { redirect, UNSAFE_invariant } from 'react-router'
import type { FormDefaultType } from '~/core/editor/types'
import { prisma } from '~/db'
import { customResponse, errorResponse } from '~/lib/response'
import { formatFieldAnswers } from '~/lib/utils'
import { ROUTES } from '~/routes'
import { getFormPage, getNextFormPage } from '~/services/form/form.service'
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
  UNSAFE_invariant(page, 'Page not found')

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

  await prisma.formAnswer.create({
    data: {
      pageId,
      participantId,
      formId,
      fieldAnswers: {
        createMany: {
          data: fieldAnswersToCreate,
        },
      },
    },
  })

  // create form answer with fieldAnswers
  if (page.pageNumber !== page.form.pagesTotal) {
    const nextPage = await getNextFormPage(page.formId, page.pageNumber)
    if (!nextPage) {
      throw new Error('Next page not found')
    }
    throw redirect(ROUTES.FORM_PAGE(formId, nextPage.pageId, participantId))
  } else {
    const formAnswers = await prisma.formAnswer.findMany({
      where: {
        formId,
        participantId,
      },
    })
    await prisma.formSubmission.create({
      data: {
        formId: page.formId,
        participantId: participantId,
        formAnswers: {
          connect: formAnswers.map((fa) => ({ id: fa.id })),
        },
      },
    })
  }

  //store answer, navigate on the client

  console.log(data, 'Validated Data')

  return customResponse({ message: 'Submission successful' })
}
