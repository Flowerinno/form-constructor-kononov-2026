import { z } from 'zod'

export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional()
    .default(1),
  q: z.string().optional().default(''),
})
