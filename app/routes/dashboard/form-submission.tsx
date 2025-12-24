import { ArrowLeft, Copy } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Heading } from '~/components/ui/heading'
import { Label } from '~/components/ui/label'
import type { FormDefaultType } from '~/core/editor/types'
import { prisma } from '~/db'
import { customResponse } from '~/lib/response'
import { ROUTES } from '~/routes'
import { getDownloadUrl, getFilePrefix, verifyFileUpload } from '~/services/files/files.service'
import type { Route } from './+types/form-submission'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const submission = await prisma.formSubmission.findUniqueOrThrow({
    where: { submissionId: params.submissionId },
    include: {
      participant: {
        select: {
          participantId: true,
          email: true,
        },
      },
      formAnswers: {
        select: {
          answerId: true,
          pageId: true,
          page: {
            select: {
              pageId: true,
              pageNumber: true,
              title: true,
              pageFields: true,
            },
          },
          fieldAnswers: {
            select: {
              fieldId: true,
              answer: true,
              type: true,
              formAnswerId: true,
            },
          },
        },
      },
    },
  })

  const files: Record<string, string[]> = {}
  for (const formAnswer of submission.formAnswers) {
    const pageFields = JSON.parse(formAnswer.page.pageFields as string) as FormDefaultType
    for (const component of pageFields.content) {
      if (component.type === 'FileField') {
        const prefix = getFilePrefix({
          formId: submission.formId,
          pageId: formAnswer.pageId,
          participantId: submission.participantId,
          fieldId: component.props.id,
        })
        const filesForPrefix = await verifyFileUpload(prefix)

        if (
          filesForPrefix.keyCount > 0 &&
          filesForPrefix.contents &&
          filesForPrefix.contents.length > 0
        ) {
          for (const fileObject of filesForPrefix.contents) {
            if (fileObject.Key === undefined) continue
            const fileUrl = await getDownloadUrl(fileObject.Key)
            files[component.props.id] = [...(files[component.props.id] || []), fileUrl]
          }
        }
      }
    }
  }

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

      {data.submission.formAnswers.map((formAnswer) => {
        const parsedPageFields = JSON.parse(formAnswer.page.pageFields as string) as FormDefaultType
        return (
          <div key={formAnswer.answerId} className='mb-8 w-full border-b'>
            <div className='grid grid-cols-1 sm:grid-cols-3'>
              <p className='mb-4 text-xl uppercase font-semibold'>
                {formAnswer.page.title} ({formAnswer.page.pageNumber})
              </p>
              <div className='col-span-2'>
                {formAnswer.fieldAnswers.map((fieldAnswer) => {
                  const fieldTitle =
                    parsedPageFields.content.find((block) => block.props.id === fieldAnswer.fieldId)
                      ?.props.label || fieldAnswer.fieldId

                  return (
                    <div key={fieldAnswer.formAnswerId} className='mb-4 flex items-center gap-4'>
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
                        {fieldAnswer.type === 'FILEFIELD' && data.files[fieldAnswer.fieldId] && (
                          <div className='ml-4 flex items-center gap-2'>
                            {data.files[fieldAnswer.fieldId].map((fileUrl, index) => {
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
