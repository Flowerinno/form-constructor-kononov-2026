import type { Participant } from 'generated/prisma/client'
import { TIME } from '~/core/constant'
import { prisma } from '~/db'
import { getRedisEntry, setRedisEntry } from '~/lib/redis'
import { customResponse } from '~/lib/response'
import { getFilePrefix } from '~/lib/utils'
import { getUploadUrl } from '~/services/files/files.service.server'
import { getPresignedUploadUrlSchema } from '~/validation/files'
import type { Route } from './+types/upload.signed'

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await request.json()
  const { formId, pageId, participantId, fieldId, fileType, fileSize } =
    getPresignedUploadUrlSchema.parse(body)

  let participant = await getRedisEntry<Participant>('participant:' + participantId)

  if (!participant) {
    participant = await prisma.participant.findUniqueOrThrow({
      where: { participantId, completedAt: null },
    })
    await setRedisEntry('participant:' + participantId, participant, TIME.ONE_MINUTE)
  }

  const uploadUrl = await getUploadUrl(
    getFilePrefix({
      formId,
      pageId,
      participantId,
      fieldId,
      isUpload: true,
    }),
    fileType,
    fileSize,
    3600,
  )

  return customResponse({
    uploadUrl,
  })
}
