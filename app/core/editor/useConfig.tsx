import { type Config, type PuckContext } from '@measured/puck'
import type { Form as DBForm, Page } from 'generated/prisma/client'
import React, { useEffect } from 'react'
import { useFetcher } from 'react-router'
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
import { cn } from '~/lib/utils'
import { ROUTES } from '~/routes'

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

type Components = {
  ButtonBlock: {
    text: string
    variant: 'default' | 'destructive' | 'outline'
    alignment: 'left' | 'center' | 'right'
  }
  TextInputField: { label: string; placeholder: string; required: boolean }
  TextareaField: {
    label: string
    placeholder: string
    required: boolean
    rows: number
  }
  SelectField: {
    label: string
    options: { value: string; label: string }[]
    placeholder: string
    required: boolean
  }
  RadioGroupField: {
    label: string
    options: { value: string; label: string }[]
    required: boolean
  }
  CheckboxField: { label: string; required: boolean; defaultChecked: boolean }
  FileField: { label: string; accept: string; multiple: boolean; required: boolean }
  HeadingBlock: { level: '1' | '2' | '3'; text: string }
  DescriptionBlock: { text: string }
  TwoColumnLayout: {
    leftColumn: React.ComponentType
    rightColumn: React.ComponentType
  }
}

export type ConfigProps = {
  formId: string
  pageId: string
  participantId: string | null
  isPreview?: boolean
  page: Page
  pagesTotal: number
  theme: DBForm['theme']
}

export type RootProps = {
  children: React.ReactNode
  pageMaxWidth?: number
  alignment: 'left' | 'center'
  puck: PuckContext
}

type ResponseError =
  | {
      message: string
      errors: { id: string; message: string }[]
    }
  | undefined

const getTextColor = (theme: 'LIGHT' | 'DARK' | undefined) => {
  return theme === 'LIGHT' ? '#0a0a0a' : '#fafafa'
}

const isFormError = (data: ResponseError, id: string) => {
  const error = data?.errors.find((e) => e.id === id)
  if (error) {
    return <span className='text-red-500'>{error.message}</span>
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
}: ConfigProps): Config<Components, RootProps> {
  const fetcher = useFetcher()
  const data = fetcher.data as ResponseError

  useEffect(() => {
    if (data && data?.errors) {
      console.log('Form submission errors:', data.errors)
    } else {
      console.log('Form submitted successfully')
    }
  }, [data])

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
              <Select required={required} name={id}>
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
              <RadioGroup required={required} name={id}>
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
              defaultChecked={defaultChecked}
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
              <Input
                id={id}
                name={id}
                type='file'
                accept={accept || undefined}
                multiple={multiple}
                required={required}
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

        let buttonText = 'Next'
        let action: string | undefined = isPreview ? undefined : ROUTES.API_FORM_SUBMISSIONS_NEXT

        if (isLastStep) {
          action = ROUTES.API_FORM_SUBMISSIONS_SUBMIT
          buttonText = 'Submit'
        }

        const disabled = isPreview || (isPreview && isLastStep)

        const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()

          if (isPreview) {
            return
          }

          console.log('Submitting form...')
          fetcher.submit(event.currentTarget, {
            method: 'POST',
            action,
          })
        }

        return (
          <div
            id='puckpage-container'
            className={`w-full h-full min-h-full p-6 flex flex-col items-center ${theme === 'LIGHT' ? 'light bg-white' : 'dark'}`}
          >
            <fetcher.Form
              noValidate
              onSubmit={onSubmit}
              onReset={(e) => e.preventDefault()}
              style={{
                maxWidth: pageMaxWidth + 'px',
                width: '100%',
              }}
              className={`flex flex-col items-${alignment} justify-start space-y-6 h-full min-h-full`}
            >
              <input type='hidden' name='participantId' value={participantId ?? ''} />
              <input type='hidden' name='formId' value={formId} />
              <input type='hidden' name='pageId' value={pageId} />
              <main className='puck-root'>{children}</main>
              <Button disabled={disabled} type='submit' className={cn('max-w-[300px]')}>
                {buttonText}
              </Button>
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
