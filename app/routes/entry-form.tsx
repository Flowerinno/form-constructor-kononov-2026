import { redirect, UNSAFE_invariant, useFetcher } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { customResponse } from '~/lib/response'
import { ROUTES } from '~/routes'
import { checkExistingFormSubmission, getFormById } from '~/services/form/form.service'
import {
  createFormParticipant,
  getFormParticipantByEmail,
} from '~/services/participant/participant.service'
import { entryFormSubmission } from '~/validation/form'
import type { Route } from './+types/entry-form'

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData()
  const { email } = await entryFormSubmission.parseAsync(Object.fromEntries(formData))

  const form = await getFormById(params.formId)

  if (!form || form.pages.length === 0 || !form.publishedAt) {
    throw new Error('Form not found')
  }

  if (form.pages.some((page) => !page.pageFields)) {
    throw new Error('Form has empty pages')
  }

  const firstPage = form.pages.find((page) => page.pageNumber === 1)
  UNSAFE_invariant(firstPage, 'First page not found - not valid form configuration')

  let participant = await getFormParticipantByEmail(email, params.formId)

  if (!participant) {
    participant = await createFormParticipant(email, params.formId)
  } else {
    const existingSubmission = await checkExistingFormSubmission(
      params.formId,
      participant.participantId,
    )
    if (existingSubmission && form.allowResubmission === false) {
      return customResponse({
        message: 'You have already submitted this form and resubmissions are not allowed.',
      })
    }
  }

  const redirectURL = ROUTES.FORM_PAGE(params.formId, firstPage.pageId, participant.participantId)
  throw redirect(redirectURL)
}

type EntryFormFetcherData = Awaited<ReturnType<typeof action>>

const EntryForm = () => {
  const fetcher = useFetcher()
  const response: EntryFormFetcherData = fetcher.data

  return (
    <div className='h-full w-full min-h-full min-w-full flex items-center justify-center'>
      <fetcher.Form method='POST' className='w-full max-w-md p-6 rounded-md shadow-md'>
        <Label htmlFor='email' className='mb-2 block text-sm font-medium text-gray-700'>
          Please enter your email address to fill out the form
        </Label>
        {response?.data && <p className='mb-2 text-sm text-red-600'>{response.data.message}</p>}
        <Input name='email' type='email' placeholder='Email address' />
        <Button type='submit' className='mt-4 w-full'>
          Start
        </Button>
      </fetcher.Form>
    </div>
  )
}

export default EntryForm
