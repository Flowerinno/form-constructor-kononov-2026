import {
  getDownloadUrl,
  getFilesByPrefix,
  getServerFilePrefix,
} from '~/services/files/files.service.server'
import type { getFormPage } from '~/services/form/form.service'

export async function decodeExistingPageAnswers(data: Awaited<ReturnType<typeof getFormPage>>) {
  const fieldsAnswers: Record<string, unknown>[] = []

  if (!data?.form || !data?.pageAnswers) {
    return fieldsAnswers
  }

  for (const pageAnswer of data.pageAnswers) {
    for (const fieldAnswer of pageAnswer.fieldAnswers) {
      if (fieldAnswer.type === 'FILEFIELD') {
        const prefix = getServerFilePrefix({
          formId: data.formId,
          pageId: pageAnswer.referencePageId,
          participantId: pageAnswer.participantId,
          fieldId: fieldAnswer.fieldId,
        })

        const files = await getFilesByPrefix(prefix)
        const fileUrls: string[] = []

        if (files.keyCount > 0 && files.contents && files.contents.length > 0) {
          for (const fileObject of files.contents) {
            if (fileObject.Key === undefined) continue
            const fileUrl = await getDownloadUrl(fileObject.Key)
            fileUrls.push(fileUrl)
          }
        }

        fieldsAnswers.push({
          [fieldAnswer.fieldId]: fileUrls,
        })
        continue
      }
      fieldsAnswers.push({
        [fieldAnswer.fieldId]: fieldAnswer.answer,
      })
    }
  }

  return fieldsAnswers
}
