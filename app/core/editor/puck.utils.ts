import { toast } from 'sonner'
import { logger } from '~/lib/logger'
import { ROUTES } from '~/routes'
import { validateFiles } from '~/validation/general'

export const getTextColor = (theme: 'LIGHT' | 'DARK' | undefined) => {
  return theme === 'LIGHT' ? '#0a0a0a' : '#fafafa'
}

export const uploadFiles = async (
  files: FileList | null,
  formId: string,
  pageId: string,
  participantId: string | null,
  fieldId: string,
) => {
  if (!participantId || !formId || !pageId || !fieldId) return

  try {
    const validFiles = validateFiles(files, 5) // can be dynamic but who cares

    await Promise.all([
      validFiles.map(async (file) => {
        try {
          const presignedUrl = await fetch(ROUTES.API_FILES_UPLOAD_SIGNED, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileType: file.type,
              formId,
              pageId,
              participantId,
              fieldId,
            }),
          })

          const { data } = await presignedUrl.json()

          if (data && data?.uploadUrl) {
            fetch(data.uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            })
          }
        } catch (error) {
          logger.error(error, 'File upload error:')
          toast.error(`Failed to upload file: ${file.name}, please try again.`)
          throw error
        }
      }),
    ])
  } catch (error) {
    logger.error(error, 'File validation/upload error:')
    if (error instanceof Error) {
      toast.error(error.message || 'File upload error, please try again.')
    }
  }
}
