import { toast } from 'sonner'
import { logError } from '~/lib/logger'
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
              fileSize: file.size,
              formId,
              pageId,
              participantId,
              fieldId,
            }),
          })

          const { data } = await presignedUrl.json()

          if (data && data?.uploadUrl) {
            await fetch(data.uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            })
          } else {
            toast.error(`Failed to upload ${file.name}`)
          }
        } catch (error) {
          logError({
            error,
            message: 'File validation/upload error:',
            meta: {
              formId,
              pageId,
              participantId,
            },
          })
          toast.error(`Failed to upload file: ${file.name}, please try again.`)
          throw error
        }
      }),
    ])
  } catch (error) {
    logError({
      error,
      message: 'File upload error:',
      meta: {
        formId,
        pageId,
        participantId,
      },
    })
    if (error instanceof Error) {
      toast.error(error.message || 'File upload error, please try again.')
    }
  }
}
