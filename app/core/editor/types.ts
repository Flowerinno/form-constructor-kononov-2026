import type { PuckContext } from '@measured/puck'
import type { Form as DBForm, Page } from 'generated/prisma/client'
import type { ComponentType, ReactNode } from 'react'
import type { ComponentsEnum } from './useConfig'

export type FormDefaultType = {
  root: {
    props: Record<string, string | number>
  }
  content: {
    type: (typeof ComponentsEnum)[number]
    props: {
      id: string
      label: string
      required?: boolean
      options?: {
        label: string
        value: string
      }[]
    }
  }[]
  zones: {}
}

export type PaginationParams = {
  page: number
  take: number
}

export type PaginationData = {
  totalItems: number
  totalPages: number
  currentPage: number
  perPage: number
}

export type Components = {
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
    leftColumn: ComponentType
    rightColumn: ComponentType
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
  decodedPageAnswers?: Record<string, unknown>[]
}

export type RootProps = {
  children: ReactNode
  pageMaxWidth?: number
  alignment: 'left' | 'center'
  puck: PuckContext
}
