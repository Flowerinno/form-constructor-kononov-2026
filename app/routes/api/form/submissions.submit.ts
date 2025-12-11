import { UNSAFE_invariant } from 'react-router'
import type { FormDefaultType } from '~/core/editor/types'
import { customResponse } from '~/lib/response'
import { getFormPage } from '~/services/form/form.service'
import { buildZodSchema } from '~/validation/form'
import type { Route } from './+types/submissions.submit'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const formId = formData.get('formId') as string
  const pageId = formData.get('pageId') as string
  const participantId = formData.get('participantId') as string

  const page = await getFormPage(pageId, formId)
  UNSAFE_invariant(page, 'Page not found')

  const pageFields = JSON.parse(page.pageFields as string) as FormDefaultType

  console.log(page.pageFields as FormDefaultType)
  console.log('Raw Form Data:', Object.fromEntries(formData))

  const schema = buildZodSchema(pageFields)
  console.log(schema, 'Generated Zod Schema')

  const { success, error, data } = schema.safeParse(Object.fromEntries(formData))

  // add delay for demo purposes
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!success) {
    return Response.json(
      {
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({
          id: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    )
  }

  //store answer, navigate on the client

  console.log(data, 'Validated Data')

  return customResponse({ message: 'Submission successful' })
}
