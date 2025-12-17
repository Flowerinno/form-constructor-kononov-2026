import { z } from 'zod'
import type { FormDefaultType } from '~/core/editor/types'
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

export const deletePageSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
})

export const deleteFormSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
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

export const buildZodSchema = (pageFields: FormDefaultType) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    participantId: z.string().min(1, 'Participant ID is required'),
    formId: z.string().min(1, 'Form ID is required'),
    pageId: z.string().min(1, 'Page ID is required'),
  }

  for (const { type, props } of pageFields.content) {
    if (!props.id) {
      throw new Error(`Field is missing an ID.`)
    }

    if (ComponentsEnum.includes(type) === false) {
      throw new Error(`Unsupported component type: ${type}`)
    }
  }

  for (const component of pageFields.content) {
    const { type, props } = component
    const fieldId = props.id

    let fieldSchema = null

    switch (type) {
      case 'TextInputField':
      case 'TextareaField':
        // case 'FileField': check file handling by looking at s3 uploads by id
        fieldSchema = z.string()

        if (props?.required && props.required === true) {
          fieldSchema = fieldSchema.min(1, `${props.label} is required.`)
        }

        schemaFields[fieldId] = fieldSchema
        break

      case 'SelectField':
        if (!props.options || props.options.length === 0) {
          throw new Error(`SelectField with id ${fieldId} has no options defined.`)
        }

        const allowedSelectValues = props.options.map((opt) => opt.value)

        fieldSchema = z.string()

        if (props?.required && props.required === true) {
          fieldSchema = z.enum(allowedSelectValues, {
            error: () => `Provided invalid option for ${props.label}`,
          })
          fieldSchema = fieldSchema.refine((val) => val !== '', {
            message: `${props.label} is required.`,
          })
        }
        schemaFields[fieldId] = fieldSchema
        break

      case 'RadioGroupField':
        if (!props.options || props.options.length === 0) {
          throw new Error(`RadioGroupField with id ${fieldId} has no options defined.`)
        }

        const radioValues = props.options.map((opt) => opt.value)
        fieldSchema = z.enum(radioValues, {
          error: `Provided invalid option for ${props.label}`,
        })

        if (props?.required && props.required === true) {
          fieldSchema = fieldSchema.refine((val) => val !== '', {
            message: `${props.label} is required.`,
          })
        }
        schemaFields[fieldId] = fieldSchema
        break

      case 'CheckboxField':
        fieldSchema = z.transform((val) => {
          if (val === 'on') return true
          return false
        })

        if (props?.required && props.required === true) {
          fieldSchema = fieldSchema.refine((val) => val === true, {
            message: `You must accept ${props.label}.`,
          })
        }
        schemaFields[fieldId] = fieldSchema
        break

      default:
        console.warn(`Skipping field type: ${type} for field ID: ${fieldId}`)
        continue
    }
  }

  return z.object(schemaFields).loose()
}
