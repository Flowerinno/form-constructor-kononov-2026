import {
  type ListObjectsV2Output,
  type PutObjectCommandInput,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from '~/lib/logger'

const BUCKET_KEY = 'uploads'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
})

export async function getUploadUrl(
  bucketName: string = BUCKET_KEY,
  key: string,
  expiresIn: number = 3600,
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    logger.error(error, `Error generating upload URL for ${key} in bucket ${bucketName}:`)
    throw error
  }
}

export const getDownloadUrl = async (
  bucketName: string = BUCKET_KEY,
  key: string,
  expiresIn: number = 3600,
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    logger.error(error, `Error generating download URL for ${key} in bucket ${bucketName}:`)
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

export async function listBucketObjects(
  bucketName: string = BUCKET_KEY,
  prefix?: string,
): Promise<ListObjectsV2Output['Contents']> {
  const listParams = {
    Bucket: bucketName,
    Prefix: prefix,
  }

  try {
    const command = new ListObjectsV2Command(listParams)
    const response: ListObjectsV2Output = await s3Client.send(command)

    return response.Contents || []
  } catch (error) {
    logger.error(error, `Error listing objects in bucket ${bucketName}:`)
    throw error
  }
}
