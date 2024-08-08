import {
  S3Client,
  GetObjectCommand,
  ListBucketsCommand
} from '@aws-sdk/client-s3'

import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

function createS3() {
  try {
    const logger = createLogger()
    logger.info('configure AWS client')

    const awsConfig = config.get('aws')
    const isDevelopment = config.get('isDevelopment')
    const s3 = new S3Client({
      region: awsConfig.region,
      forcePathStyle: isDevelopment,
      endpoint: isDevelopment ? 'http://localhost:4566' : undefined,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey
      }
    })

    logger.info(
      `setup bucket client accessKeyId: ${awsConfig.accessKeyId} region: ${awsConfig.region}`
    )
    return s3
  } catch (error) {
    const logger = createLogger()
    logger.error(error)
  }
}

async function streamToString(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}

async function download(key) {
  const logger = createLogger()
  const client = createS3()
  const awsConfig = config.get('aws')

  logger.info(`downloading ${key} from bucket ${awsConfig.bucketName}`)

  let input = {}
  const command = new ListBucketsCommand(input)
  const response = await client.send(command)

  const hasBucket = response.Buckets?.some(
    (bucket) => bucket.Name === awsConfig.bucketName
  )

  if (!hasBucket) {
    client.destroy()

    return []
  }

  input = {
    Bucket: awsConfig.bucketName,
    Key: key
  }

  const getCommand = new GetObjectCommand(input)
  const data = await client.send(getCommand)

  logger.info('download complete')

  return JSON.parse(await streamToString(data.Body))
}

export { download }
