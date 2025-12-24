import { z } from 'zod'

export const getPresignedUploadUrlSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  pageId: z.string().min(1, 'Page ID is required'),
  participantId: z.string().min(1, 'Participant ID is required'),
  fieldId: z.string().min(1, 'Field ID is required'),
  fileType: z.string(),
})

export type GetPresignedUploadUrlType = z.infer<typeof getPresignedUploadUrlSchema>
