import { z } from 'zod'

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

export type CreateFormSchema = z.infer<typeof createFormSchema>
