import { Form, redirect, UNSAFE_invariant } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ROUTES } from '~/routes'
import { getFormById } from '~/services/form/form.service'
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
    // get latest page for participant and redirect there
    // const latestAnsweredPage = participant.formAnswers.find(answer => answer)
  }

  const redirectURL = ROUTES.FORM_PAGE(params.formId, firstPage.pageId, participant.participantId)

  throw redirect(redirectURL + '?participantId=' + participant.participantId)
}

const EntryForm = () => {
  return (
    <div className='h-full w-full min-h-full min-w-full flex items-center justify-center'>
      <Form method='POST' navigate={false} className='w-full max-w-md p-6 rounded-md shadow-md'>
        <Label htmlFor='email' className='mb-2 block text-sm font-medium text-gray-700'>
          Please enter your email address to fill out the form
        </Label>
        <Input name='email' type='email' placeholder='Email address' />
        <Button type='submit' className='mt-4 w-full'>
          Start
        </Button>
      </Form>
    </div>
  )
}

export default EntryForm
