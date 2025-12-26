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
  expiresIn: number = 30, // 30 seconds is enough for a single upload safeguard, couldn't find docs on max limit here with client side upload
): Promise<string> {
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

export async function verifyFileUpload(
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

type FileNameParams = {
  formId: string
  pageId: string
  participantId: string
  fieldId: string
  isUpload?: boolean
}

export const getFilePrefix = ({
  formId,
  pageId,
  participantId,
  fieldId,
  isUpload = false,
}: FileNameParams) => {
  return `${formId}-${pageId}-${participantId}-${fieldId}-${isUpload ? Date.now() : ''}`
}
