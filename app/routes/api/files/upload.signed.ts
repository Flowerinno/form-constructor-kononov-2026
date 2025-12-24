import { prisma } from '~/db'
import { customResponse } from '~/lib/response'
import { getFilePrefix, getUploadUrl } from '~/services/files/files.service'
import { getPresignedUploadUrlSchema } from '~/validation/files'
import type { Route } from './+types/upload.signed'

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await request.json()
  const { formId, pageId, participantId, fieldId, fileType } =
    getPresignedUploadUrlSchema.parse(body)

  await prisma.participant.findUniqueOrThrow({
    where: { participantId },
  })

  const uploadUrl = await getUploadUrl(
    getFilePrefix({
      formId,
      pageId,
      participantId,
      fieldId,
      isUpload: true,
    }),
    fileType,
    3600,
  )

  return customResponse({
    uploadUrl,
  })
}
