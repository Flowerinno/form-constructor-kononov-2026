import { z } from 'zod'
import { MAX_FILE_SIZE } from './files'

export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional()
    .default(1),
  q: z.string().optional().default(''),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  date: z.string().optional(),
})
export type QueryParams = z.infer<typeof paginationSchema>

export const validateFiles = (files: FileList | null, maxFiles: number) => {
  if (!files) return []

  if (files.length > maxFiles) {
    throw new Error(`You can upload a maximum of ${maxFiles} files.`)
  }

  const validFiles: File[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds the maximum size of 10MB.`)
    }
    validFiles.push(file)
  }

  return validFiles
}
