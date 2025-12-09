import { z } from 'zod'
import { ComponentsEnum } from '~/core/editor/useConfig'

export const createFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Form title is required')
    .max(50, 'Form title must be at most 50 characters long'),
  description: z
    .string()
    .max(200, 'Form description must be at most 200 characters long')
    .optional(),
})

export const updateThemeFormSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  theme: z.enum(['LIGHT', 'DARK']),
})

export const jsonDataSchema = z.object({
  root: z.object({
    props: z.object({ pageMaxWidth: z.number(), theme: z.string() }),
  }),
  content: z.array(
    z.object({
      type: z.enum(ComponentsEnum),
      props: z.object(),
    }),
  ),
  zones: z.object({}),
})

export const updateFormSchema = z.object({
  data: z.json().nullable(),
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
})

export const updatePageGeneral = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
  title: z
    .string()
    .min(1, 'Page name is required')
    .max(100, 'Page name must be at most 100 characters long'),
})

export type CreateFormSchema = z.infer<typeof createFormSchema>

export const validateSubmissionPayload = (data: FormData) => {
  try {
  } catch (error) {}
}
