import { ArrowLeft, Copy } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Heading } from '~/components/ui/heading'
import { Label } from '~/components/ui/label'
import type { FormDefaultType } from '~/core/editor/types'
import { customResponse } from '~/lib/response'
import { ROUTES } from '~/routes'
import { extractFilesFromAnswers } from '~/services/files/files.service.server'
import { getUniqueFormSubmission } from '~/services/form/form.service'
import type { Route } from './+types/form-submission'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const submission = await getUniqueFormSubmission(params.submissionId)
  const files = await extractFilesFromAnswers(submission)

  return customResponse({
    formId: params.formId,
    submissionId: params.submissionId,
    submission,
    files,
  })
}

const FormSubmission = () => {
  const { data } = useLoaderData<typeof loader>()

  const writeToClipboard = (text: string) => {
    if (window && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }
  // console.log(data.files, 'data.files')

  return (
    <div>
      <Heading>
        <Link to={ROUTES.DASHBOARD_FORM_SUBMISSIONS(data.formId)} viewTransition>
          <Button variant={'ghost'} className='mb-4'>
            <ArrowLeft /> Back to submissions
          </Button>
        </Link>{' '}
      </Heading>
      <div className='rounded-md border grid sm:grid-cols-2 gap-4 p-4 mb-6'>
        <Label>
          Participant ID:
          <Button
            onClick={() => writeToClipboard(data.submission.participant.participantId || 'N/A')}
            size={'sm'}
            className='underline underline-offset-2 cursor-pointer flex items-center gap-2 hover:font-bold'
          >
            {data.submission.participant.participantId || 'N/A'} <Copy />
          </Button>
        </Label>
        <Label>
          Participant Email:{' '}
          <Button
            onClick={() => writeToClipboard(data.submission.participant.email || 'N/A')}
            size={'sm'}
            className='underline underline-offset-2 cursor-pointer flex items-center gap-2 hover:font-bold'
          >
            {data.submission.participant.email || 'N/A'} <Copy />
          </Button>
        </Label>
        <Label>Completed At: {new Date(data.submission.createdAt).toLocaleString() || 'N/A'}</Label>
      </div>

      {data.submission.pageAnswers.map((pageAnswer, idx) => {
        const isPagePresent = pageAnswer.page !== null
        const parsedPageFields = isPagePresent
          ? //@ts-expect-error Not inferring type
            (JSON.parse(pageAnswer?.page.pageFields as string) as FormDefaultType)
          : null
        return (
          <div key={pageAnswer.answerId} className='mb-8 w-full border-b'>
            <div className='grid grid-cols-1 sm:grid-cols-3'>
              <p className='mb-4 text-xl uppercase font-semibold'>
                {pageAnswer?.page?.title ?? 'N/A'} ({pageAnswer?.page?.pageNumber ?? idx + 1})
              </p>
              <div className='col-span-2'>
                {pageAnswer.fieldAnswers.map((fieldAnswer) => {
                  const fieldTitle = parsedPageFields
                    ? parsedPageFields.content.find(
                        (block) => block.props.id === fieldAnswer.fieldId,
                      )?.props.label || fieldAnswer.fieldId
                    : fieldAnswer.fieldId.split('-').at(0)
                  return (
                    <div
                      key={`${fieldAnswer.pageAnswerId}-${fieldAnswer.fieldId}`}
                      className='mb-4 flex items-center gap-4'
                    >
                      <Heading level={4} className='font-medium'>
                        {fieldTitle}:
                      </Heading>
                      <div className='flex items-center'>
                        {fieldAnswer.type !== 'FILEFIELD' && (
                          <Button
                            size={'sm'}
                            onClick={() => writeToClipboard(fieldAnswer.answer)}
                            className='underline underline-offset-2 cursor-pointer hover:font-bold flex items-center gap-2'
                          >
                            {fieldAnswer.answer} <Copy />
                          </Button>
                        )}
                        {fieldAnswer.type === 'FILEFIELD' && data.files[pageAnswer.answerId] && (
                          <div className='ml-4 flex items-center gap-2'>
                            {data.files[pageAnswer.answerId].map((fileUrl, index) => {
                              return (
                                <a
                                  key={`field-${fieldAnswer.fieldId}-file-${index}`}
                                  href={fileUrl}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-600 underline underline-offset-2'
                                >
                                  File #{index + 1}
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FormSubmission
