import {
  type ListObjectsV2CommandInput,
  type ListObjectsV2Output,
  type PutObjectCommandInput,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from '~/lib/logger'

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
    logger.error(error, `Error generating upload URL for ${key} in bucket ${BUCKET_KEY}:`)
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
    logger.error(error, `Error generating download URL for ${key} in bucket ${BUCKET_KEY}:`)
    throw error
  }
}

export async function uploadFile(
  bucketName: string = BUCKET_KEY,
  key: string,
  body: PutObjectCommandInput['Body'],
  contentType: string,
): Promise<void> {
  const uploadParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  }

  try {
    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)
  } catch (error) {
    logger.error(error, `Error uploading file ${key} to bucket ${bucketName}:`)
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
    logger.error(error, `Error listing objects in bucket ${BUCKET_KEY}:`)
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
