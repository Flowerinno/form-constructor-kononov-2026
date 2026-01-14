import { type Config } from '@measured/puck'
import type { PageAnswer } from 'generated/prisma/browser'
import React, { useRef } from 'react'
import { Link, useFetcher } from 'react-router'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Heading } from '~/components/ui/heading'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Paragraph } from '~/components/ui/paragraph'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import type { ErrorResponse } from '~/lib/response'
import { cn } from '~/lib/utils'
import { ROUTES } from '~/routes'
import { getTextColor, uploadFiles } from './puck.utils'
import { type Components, type ConfigProps, type RootProps } from './types'

export const ComponentsEnum = [
  'ButtonBlock',
  'TextInputField',
  'TextareaField',
  'SelectField',
  'RadioGroupField',
  'CheckboxField',
  'FileField',
  'HeadingBlock',
  'DescriptionBlock',
  'TwoColumnLayout',
] as const

const isFormError = (data: ErrorResponse, id: string) => {
  if (!data.error) {
    return null
  }

  const error = data.error.map.find((e) => e.id === id)
  if (error) {
    return <span className='text-red-500'>{error.message}</span>
  }

  return null
}

const getFilledAnswer = (decodedPageAnswers: Record<string, unknown>[], id: string) => {
  for (const answer of decodedPageAnswers) {
    if (answer[id]) {
      return answer[id] as string
    }
  }
  return ''
}

const getFilledFileAnswers = (decodedPageAnswers: Record<string, unknown>[], id: string) => {
  for (const answer of decodedPageAnswers) {
    if (answer[id]) {
      return (
        <div className='flex gap-2 items-center'>
          {(answer[id] as string[]).map((fk, idx) => (
            <Link key={fk} to={fk} target='_blank' rel='noreferrer' className='p-1 hover:underline'>
              File {idx + 1}
            </Link>
          ))}
        </div>
      )
    }
  }
  return null
}

export function useConfig({
  formId,
  pageId,
  participantId = null,
  isPreview = false,
  page,
  pagesTotal,
  decodedPageAnswers = [],
}: ConfigProps): Config<Components, RootProps> {
  const fetcher = useFetcher()
  const data = fetcher.data as ErrorResponse
  const buttonRef = useRef<HTMLButtonElement>(null)

  return {
    components: {
      ButtonBlock: {
        fields: {
          text: { type: 'text', label: 'Text' },
          variant: {
            type: 'select',
            label: 'Variant',
            options: [
              { label: 'Default', value: 'default' },
              { label: 'Destructive', value: 'destructive' },
              { label: 'Outline', value: 'outline' },
            ],
          },
          alignment: {
            type: 'select',
            label: 'Alignment',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
          },
        },
        defaultProps: {
          text: 'Click Me',
          variant: 'default',
          alignment: 'center',
        },
        render: ({ text, variant, alignment }) => {
          return (
            <div style={{ display: 'flex', justifyContent: alignment }}>
              <Button variant={variant}>{text}</Button>
            </div>
          )
        },
      },
      TextInputField: {
        label: 'Text input',
        fields: {
          label: { type: 'text', label: 'Label' },
          placeholder: { type: 'text', label: 'Placeholder' },
          required: {
            type: 'select',
            label: 'Required',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
        },
        defaultProps: {
          label: 'Text field',
          placeholder: '',
          required: false,
        },
        render: ({ label, id, placeholder, required, puck }) => (
          <div className='space-y-1'>
            <Label
              style={{
                color: getTextColor(puck.metadata.theme),
              }}
              htmlFor={id}
            >
              {label}
              {required ? ' *' : ''} {data && isFormError(data, id)}
            </Label>
            <Input
              style={{
                color: getTextColor(puck.metadata.theme),
              }}
              id={id}
              name={id}
              placeholder={placeholder}
              required={required}
              defaultValue={getFilledAnswer(decodedPageAnswers, id)}
            />
          </div>
        ),
      },
      TextareaField: {
        label: 'Textarea',
        fields: {
          label: { type: 'text', label: 'Label' },
          placeholder: { type: 'text', label: 'Placeholder' },
          rows: { type: 'number', label: 'Rows', min: 2, max: 20 },
          required: {
            type: 'select',
            label: 'Required',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
        },
        defaultProps: {
          label: 'Textarea',
          placeholder: '',
          required: false,
          rows: 4,
        },
        render: ({ label, id, placeholder, required, rows, puck }) => (
          <div className='space-y-1'>
            <Label
              style={{
                color: getTextColor(puck.metadata.theme),
              }}
              htmlFor={id}
            >
              {label}
              {required ? ' *' : ''} {data && isFormError(data, id)}
            </Label>
            <Textarea
              id={id}
              name={id}
              placeholder={placeholder}
              required={required}
              rows={rows}
              defaultValue={getFilledAnswer(decodedPageAnswers, id)}
              style={{
                color: getTextColor(puck.metadata.theme),
              }}
            />
          </div>
        ),
      },
      SelectField: {
        label: 'Select',
        fields: {
          label: { type: 'text', label: 'Label' },
          placeholder: { type: 'text', label: 'Placeholder' },
          options: {
            type: 'array',
            label: 'Options (one per line, value|label)',
            defaultItemProps: { value: 'option', label: 'Option' },
            arrayFields: {
              value: { type: 'text', label: 'Value' },
              label: { type: 'text', label: 'Label' },
            },
          },
          required: {
            type: 'select',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
            label: 'Required',
          },
        },
        defaultProps: {
          label: 'Select field',
          placeholder: 'Select an option',
          options: [
            {
              value: 'Yes',
              label: 'Yes',
            },
            {
              value: 'No',
              label: 'No',
            },
          ],
          required: false,
        },
        render: ({ label, id, placeholder, options, required, puck }) => {
          return (
            <div className='space-y-1'>
              <Label
                style={{
                  color: getTextColor(puck.metadata.theme),
                }}
                htmlFor={id}
              >
                {label}
                {required ? ' *' : ''}
                {data && isFormError(data, id)}
              </Label>
              <Select
                defaultValue={getFilledAnswer(decodedPageAnswers, id)}
                required={required}
                name={id}
              >
                <SelectTrigger
                  style={{
                    color: getTextColor(puck.metadata.theme),
                  }}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent
                  style={{
                    color: getTextColor(puck.metadata.theme),
                  }}
                >
                  {options.map((opt) => (
                    <SelectItem
                      style={{
                        color: getTextColor(puck.metadata.theme),
                        backgroundColor: puck.metadata.theme === 'LIGHT' ? '#ffffff' : '#1a1a1a',
                      }}
                      className='rounded-none cursor-pointer hover:font-bold'
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
      },
      RadioGroupField: {
        label: 'Radio group',
        fields: {
          label: { type: 'text', label: 'Label' },
          options: {
            type: 'array',
            label: 'Options (one per line, value|label)',
            defaultItemProps: { value: 'option', label: 'Option' },
            arrayFields: {
              value: { type: 'text', label: 'Value' },
              label: { type: 'text', label: 'Label' },
            },
          },
          required: {
            type: 'select',
            label: 'Required',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
        },
        defaultProps: {
          label: 'Radio group',
          options: [
            {
              value: 'option1',
              label: 'Option 1',
            },
            { value: 'option2', label: 'Option 2' },
          ],
          required: false,
        },
        render: ({ label, id, options, required, puck }) => {
          return (
            <div className='space-y-2'>
              <Label
                style={{
                  color: getTextColor(puck.metadata.theme),
                }}
              >
                {label}
                {required ? ' *' : ''}
                {data && isFormError(data, id)}
              </Label>
              <RadioGroup
                defaultValue={getFilledAnswer(decodedPageAnswers, id)}
                required={required}
                name={id}
              >
                {options.map((opt) => (
                  <div key={opt.value} className='flex items-center space-x-2'>
                    <RadioGroupItem id={`${id}-${opt.value}`} value={opt.value} />
                    <Label
                      style={{
                        color: getTextColor(puck.metadata.theme),
                      }}
                      htmlFor={`${id}-${opt.value}`}
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        },
      },
      CheckboxField: {
        label: 'Checkbox',
        fields: {
          label: { type: 'text', label: 'Label' },
          defaultChecked: {
            type: 'select',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
            label: 'Checked by default',
          },
          required: {
            type: 'select',
            label: 'Required',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
        },
        defaultProps: {
          label: 'Accept terms',
          defaultChecked: false,
          required: false,
        },
        render: ({ label, defaultChecked, required, puck, id }) => (
          <div className='flex items-center space-x-2'>
            <Checkbox
              style={{
                color: getTextColor(puck.metadata.theme),
              }}
              id={id}
              name={id}
              required={required}
              defaultChecked={getFilledAnswer(decodedPageAnswers, id) === 'true' || defaultChecked}
            />
            <Label
              style={{
                color: getTextColor(puck.metadata.theme),
              }}
              htmlFor={id}
            >
              {label} {required ? ' *' : ''} {data && isFormError(data, id)}
            </Label>
          </div>
        ),
      },
      FileField: {
        label: 'File upload',
        fields: {
          label: { type: 'text', label: 'Label' },
          accept: { type: 'text', label: 'Accept (e.g. image/*,application/pdf)' },
          multiple: {
            type: 'select',
            label: 'Allow multiple',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
          required: {
            type: 'select',
            label: 'Required',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          },
        },
        defaultProps: {
          label: 'Upload file',
          accept: 'image/*,application/pdf',
          multiple: false,
          required: false,
        },
        render: ({ label, accept, multiple, required, puck, id }) => {
          return (
            <div className='space-y-1'>
              <Label
                htmlFor={id}
                style={{
                  color: getTextColor(puck.metadata.theme),
                }}
              >
                {label}
                {required ? ' *' : ''}
                {data && isFormError(data, id)}
              </Label>
              {getFilledFileAnswers(decodedPageAnswers, id)}
              <Input
                id={id}
                name={id}
                type='file'
                accept={accept || undefined}
                multiple={multiple}
                required={getFilledFileAnswers(decodedPageAnswers, id) ? false : required}
                onChange={async (e) => {
                  if (isPreview) return
                  buttonRef.current?.setAttribute('disabled', 'true')
                  uploadFiles(
                    e.target.files,
                    puck.metadata.formId,
                    puck.metadata.pageId,
                    puck.metadata.participantId,
                    id,
                  ).finally(() => {
                    buttonRef.current?.removeAttribute('disabled')
                  })
                }}
                style={{
                  color: getTextColor(puck.metadata.theme),
                  maxWidth: '400px',
                }}
              />
            </div>
          )
        },
      },
      HeadingBlock: {
        label: 'Heading',
        fields: {
          level: {
            type: 'select',
            label: 'Level',
            options: [
              { label: 'H1', value: '1' },
              { label: 'H2', value: '2' },
              { label: 'H3', value: '3' },
            ],
          },
          text: { type: 'text', label: 'Text' },
        },
        defaultProps: {
          level: '2',
          text: 'Title',
        },
        render: ({ level, text, puck }) => {
          return (
            <div className='space-y-2'>
              <Heading
                style={{
                  color: getTextColor(puck.metadata.theme),
                }}
                level={+level as 1 | 2 | 3}
              >
                {text}
              </Heading>
            </div>
          )
        },
      },
      DescriptionBlock: {
        label: 'Description text',
        fields: {
          text: { type: 'textarea', label: 'Text' },
        },
        defaultProps: {
          text: 'Description...',
        },
        render: ({ text, puck }) => (
          <Paragraph
            style={{
              color: getTextColor(puck.metadata.theme),
            }}
          >
            {text}
          </Paragraph>
        ),
      },
      TwoColumnLayout: {
        label: 'Two Columns',
        fields: {
          leftColumn: {
            type: 'slot',
          },
          rightColumn: {
            type: 'slot',
          },
        },
        render: ({ leftColumn: LeftColumn, rightColumn: RightColumn }) => {
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <LeftColumn />
              <RightColumn />
            </div>
          )
        },
      },
    },
    root: {
      render: ({ children, pageMaxWidth, alignment, puck }: RootProps) => {
        const { formId, pageId, isPreview, page, pagesTotal, theme, participantId } = puck.metadata

        const isLastStep = page.pageNumber === pagesTotal
        const buttonText = isLastStep ? 'Submit' : 'Next'

        const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          event.stopPropagation()

          const submitter = (event.nativeEvent as unknown as SubmitEvent)
            .submitter as HTMLButtonElement
          const intent =
            submitter?.name === 'intent' ? (submitter.value as 'next' | 'prev') : 'next'

          const action = isPreview ? undefined : ROUTES.API_FORM_SUBMISSIONS_SUBMIT

          if (intent === 'next') {
            const validated = event.currentTarget.checkValidity()
            if (!validated) {
              return
            }
          }

          if (isPreview || !action) {
            return
          }

          const formData = new FormData(event.currentTarget)
          formData.set('intent', intent)

          fetcher.submit(formData, {
            method: 'POST',
            action,
          })
        }

        const pageAnswer = page.pageAnswers?.find((pa: PageAnswer) => pa.pageId === page.pageId)
        const pageAnswerId = pageAnswer ? pageAnswer.answerId : ''

        return (
          <div
            id='puckpage-container'
            className={`w-full h-full min-h-full p-6 flex flex-col items-center ${theme === 'LIGHT' ? 'light bg-white' : 'dark'}`}
          >
            <fetcher.Form
              onSubmit={onSubmit}
              onReset={(e) => e.preventDefault()}
              style={{
                maxWidth: pageMaxWidth + 'px',
                width: '100%',
              }}
              noValidate
              className={`flex flex-col items-${alignment} justify-start space-y-6 h-full min-h-full`}
            >
              <input type='hidden' name='participantId' value={participantId ?? ''} />
              <input type='hidden' name='formId' value={formId} />
              <input type='hidden' name='pageId' value={pageId} />
              <input type='hidden' name='pageNumber' value={page.pageNumber} />
              <input type='hidden' name='pageAnswerId' value={isPreview ? '' : pageAnswerId} />
              <main className='puck-root'>{children}</main>
              <div className='flex gap-4 items-center justify-center'>
                <Button
                  ref={buttonRef}
                  disabled={page.pageNumber <= 1 || isPreview}
                  type='submit'
                  name='intent'
                  value='prev'
                  className={cn('max-w-[300px]')}
                >
                  Previous
                </Button>
                <Button
                  ref={buttonRef}
                  disabled={isPreview}
                  type='submit'
                  name='intent'
                  value='next'
                  className={cn('max-w-[300px]')}
                >
                  {buttonText}
                </Button>
              </div>
              <br />{' '}
              <strong>
                {' '}
                {page.pageNumber} / {pagesTotal}
              </strong>
            </fetcher.Form>
          </div>
        )
      },
      defaultProps: {
        pageMaxWidth: 1200,
        alignment: 'center',
      },
      fields: {
        pageMaxWidth: {
          label: 'Max Width (px)',
          type: 'number',
          min: 0,
          max: 1600,
        },
        alignment: {
          label: 'Alignment',
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
        },
      },
      metadata: {
        formId,
        pageId,
        participantId,
        isPreview,
        page,
        pagesTotal,
      },
    },
  }
}
