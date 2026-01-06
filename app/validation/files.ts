import { z } from 'zod'

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const getPresignedUploadUrlSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
  participantId: z.string().min(1, 'Participant ID is required'),
  fieldId: z.string().min(1, 'Field ID is required'),
  fileType: z.string(),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
})

export type GetPresignedUploadUrlType = z.infer<typeof getPresignedUploadUrlSchema>
