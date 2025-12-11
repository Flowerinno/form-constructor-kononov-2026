import type { PuckContext } from '@measured/puck'
import { Puck } from '@measured/puck'
import '@measured/puck/puck.css'
import type { Form, Page } from 'generated/prisma/client'
import React from 'react'
import { useSubmit } from 'react-router'
import { toast } from 'sonner'
import { ROUTES } from '~/routes'
import { useConfig } from './useConfig'

export type RootProps = {
  children: React.ReactNode
  theme: 'LIGHT' | 'DARK'
  pageMaxWidth?: number
  puck: PuckContext
}

type FormEditorProps = {
  formId: string
  pageId: string
  participantId: string | null
  isPreview?: boolean
  page: Page
  pagesTotal: number
  theme: Form['theme']
}

const initialData = {
  content: [
    {
      type: 'HeadingBlock',
      props: {
        id: 'HeadingBlock-' + crypto.randomUUID(),
        text: 'Welcome to the Form Editor!',
        level: '2',
      },
    },
    {
      type: 'DescriptionBlock',
      props: {
        id: 'DescriptionBlock-' + crypto.randomUUID(),
        text: 'Start building your form by adding new fields and components.',
      },
    },
  ],
  root: { props: { pageMaxWidth: 1200, alignment: 'center' } },
  zones: {},
}

export function FormEditor({
  formId,
  pageId,
  participantId,
  isPreview = false,
  page,
  pagesTotal,
  theme,
}: FormEditorProps) {
  const submit = useSubmit()

  const save = (data: unknown) => {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))
    formData.append('formId', formId)
    formData.append('pageId', pageId)
    submit(formData, { method: 'POST', action: ROUTES.API_FORM_UPDATE, navigate: false })
    toast.success('Page saved')
  }

  const objectToPass = {
    formId,
    pageId,
    participantId,
    isPreview,
    page,
    pagesTotal,
    theme,
  } as const

  const config = useConfig(objectToPass)

  const editorData = page?.pageFields ? JSON.parse(page.pageFields as string) : initialData

  return <Puck config={config} data={editorData} metadata={objectToPass} onPublish={save} />
}
