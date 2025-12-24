import { z } from 'zod'

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

const maxFileSizeBytes = 10 * 1024 * 1024
export const validateFiles = (files: FileList | null, maxFiles: number) => {
  if (!files) return []

  if (files.length > maxFiles) {
    throw new Error(`You can upload a maximum of ${maxFiles} files.`)
  }

  const validFiles: File[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size > maxFileSizeBytes) {
      throw new Error(`File ${file.name} exceeds the maximum size of 10MB.`)
    }
    validFiles.push(file)
  }

  return validFiles
}
