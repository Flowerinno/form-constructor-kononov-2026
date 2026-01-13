import { z } from 'zod'
import type { FormDefaultType } from '~/core/editor/types'
import { ComponentsEnum } from '~/core/editor/useConfig'
import { getFilePrefix } from '~/lib/utils'
import { getFilesByPrefix } from '~/services/files/files.service.server'

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

export const updateFinalPageSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  finalTitle: z
    .string()
    .min(1, 'Final page title is required')
    .max(100, 'Final page title must be at most 100 characters long'),
  finalDescription: z
    .string()
    .max(300, 'Final page description must be at most 300 characters long')
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

export const deletePageSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
})

export const deleteFormSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
})

export const duplicateFormSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  title: z
    .string()
    .min(1, 'Form title is required')
    .max(50, 'Form title must be at most 50 characters long'),
  description: z
    .string()
    .max(200, 'Form description must be at most 200 characters long')
    .optional(),
})

export const toggleFormSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
})

export const updateFormThankYouPageSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  title: z
    .string()
    .min(1, 'Thank you page title is required')
    .max(100, 'Thank you page title must be at most 100 characters long'),
  description: z
    .string()
    .max(300, 'Thank you page description must be at most 300 characters long')
    .optional(),
})

export type CreateFormSchema = z.infer<typeof createFormSchema>
export type UpdateFormThankYouPageSchema = z.infer<typeof updateFormThankYouPageSchema>

export const entryFormSubmission = z.object({
  email: z.email('Invalid email address'),
})

export const defaultFormPageFields = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
})

export const defaultFormPageFieldsWithNumber = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  formId: z.string().min(1, 'Form ID is required'),
  pageNumber: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v) && v > 0, 'Page number must be a positive number'),
  pageId: z.string().min(1, 'Page ID is required'),
  intent: z.enum(['next', 'prev']).optional().default('next'),
  pageAnswerId: z.string().nullable(),
})

export type DefaultFormPageFields = z.infer<typeof defaultFormPageFields>

const fieldHandlers: Record<
  string,
  (
    props: FormDefaultType['content'][number]['props'],
    context: { formData: DefaultFormPageFields; fieldId: string },
  ) => Promise<z.ZodTypeAny> | z.ZodTypeAny
> = {
  FileField: async (props, { formData, fieldId }) => {
    if (!props.required) return z.any().optional()

    const files = await getFilesByPrefix(getFilePrefix({ ...formData, fieldId }))
    return files.keyCount === 0
      ? z.string().min(1, `${props.label} is required.`)
      : z.any().optional()
  },

  TextInputField: (props) => {
    const schema = z.string()
    return props.required ? schema.min(1, `${props.label} is required.`) : schema.optional()
  },

  TextareaField: (props) => {
    const schema = z.string()
    return props.required ? schema.min(1, `${props.label} is required.`) : schema.optional()
  },

  SelectField: (props) => {
    if (!props.options?.length) {
      throw new Error(`SelectField ${props.id} missing options.`)
    }

    const values = props.options.map((o: any) => o.value)

    const schema = z.enum(values, {
      error: () => `Invalid option for ${props.label}`,
    })
    return props.required ? schema : schema.optional()
  },

  CheckboxField: (props) => {
    const schema = z.preprocess((val) => val === 'on', z.boolean())
    return props.required ? schema.refine((v) => v === true, `${props.label} is required.`) : schema
  },

  RadioGroupField: (props) => {
    if (!props.options?.length) {
      throw new Error(`RadioGroupField ${props.id} missing options.`)
    }

    const values = props.options.map((o: any) => o.value)
    const schema = z.enum(values, {
      error: () => `Invalid option for ${props.label}`,
    })
    return props.required ? schema : schema.optional()
  },
}

export const buildZodSchema = async (
  pageFields: FormDefaultType,
  formData: DefaultFormPageFields,
) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    formId: z.string().min(1),
    pageId: z.string().min(1),
    participantId: z.string().min(1),
  }

  for (const { type, props } of pageFields.content) {
    if (!props.id) throw new Error('Field missing ID')

    const handler = fieldHandlers[type]
    if (handler) {
      schemaFields[props.id] = await handler(props, { formData, fieldId: props.id })
    }
  }

  return z.object(schemaFields).loose()
}
