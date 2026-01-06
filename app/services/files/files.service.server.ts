'use server'
import {
  type ListObjectsV2CommandInput,
  type ListObjectsV2Output,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logError } from '~/lib/logger'
import { MAX_FILE_SIZE } from '~/validation/files'
import type { getUniqueFormSubmission } from '../form/form.service'

export const BUCKET_KEY = 'uploads'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
})

export async function getUploadUrl(
  key: string,
  fileType: string,
  fileSize: number,
  expiresIn: number = 30,
): Promise<string> {
  if (fileSize > MAX_FILE_SIZE || !fileSize) {
    throw new Error(`File size exceeds the max/min limit (0-${MAX_FILE_SIZE}) bytes`)
  }
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_KEY,
      Key: key,
      ContentType: fileType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    logError({
      error,
      message: `Error generating upload URL`,
      meta: { key, bucket: BUCKET_KEY },
    })
    throw error
  }
}

export const getDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_KEY,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    logError({
      error,
      message: `Error generating download URL`,
      meta: { key, bucket: BUCKET_KEY },
    })
    throw error
  }
}

export async function getFilesByPrefix(
  prefix: string,
): Promise<{ contents: ListObjectsV2Output['Contents']; keyCount: number }> {
  const listParams: ListObjectsV2CommandInput = {
    Bucket: BUCKET_KEY,
    Prefix: prefix,
    Delimiter: '/',
    MaxKeys: 10,
  }

  try {
    const command = new ListObjectsV2Command(listParams)
    const response: ListObjectsV2Output = await s3Client.send(command)
    return { contents: response.Contents || [], keyCount: response.KeyCount || 0 }
  } catch (error) {
    logError({
      error,
      message: `Error listing objects in bucket`,
      meta: { prefix, bucket: BUCKET_KEY },
    })
    throw error
  }
}

export async function extractFilesFromAnswers(
  submission: Awaited<ReturnType<typeof getUniqueFormSubmission>>,
) {
  const files: Record<string, string[]> = {}

  for (const pageAnswer of submission.pageAnswers) {
    for (const fieldAnswer of pageAnswer.fieldAnswers) {
      // field answer
      if (fieldAnswer.type !== 'FILEFIELD') {
        continue
      }

      const prefix = getServerFilePrefix({
        formId: submission.formId,
        pageId: pageAnswer.referencePageId,
        participantId: submission.participantId,
        fieldId: fieldAnswer.fieldId,
      })
      const filesForPrefix = await getFilesByPrefix(prefix)

      if (
        filesForPrefix.keyCount > 0 &&
        filesForPrefix.contents &&
        filesForPrefix.contents.length > 0
      ) {
        for (const fileObject of filesForPrefix.contents) {
          if (fileObject.Key === undefined) continue
          const fileUrl = await getDownloadUrl(fileObject.Key)
          files[pageAnswer.answerId] = [...(files[pageAnswer.answerId] || []), fileUrl]
        }
      }
    }
  }
  return files
}

type FileNameParams = {
  formId: string
  pageId: string
  participantId: string
  fieldId: string
  isUpload?: boolean
}

export function getServerFilePrefix({
  formId,
  pageId = '',
  participantId,
  fieldId,
  isUpload = false,
}: FileNameParams) {
  return `${formId}-${pageId}-${participantId}-${fieldId}-${isUpload ? Date.now() : ''}`
}
