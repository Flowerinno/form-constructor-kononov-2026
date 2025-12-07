import { z } from 'zod'

export const profileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(30, 'Name must be at most 30 characters long'),
})
