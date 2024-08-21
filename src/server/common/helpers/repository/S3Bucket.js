import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const s3ClientPlugin = {
  plugin: {
    name: 's3Client',
    version: '0.1.0',
    register: (server) => {
      const logger = createLogger()
      logger.info('configure AWS client')
      const awsConfig = config.get('aws')
      const isDevelopment = config.get('isDevelopment')

      const s3Client = new S3Client({
        region: awsConfig.region,
        forcePathStyle: isDevelopment,
        endpoint: awsConfig.s3Endpoint
      })

      logger.info(`setup bucket client region: ${awsConfig.region}`)
      server.decorate('request', 's3', s3Client)
      server.decorate('server', 's3', s3Client)

      server.events.on('stop', () => {
        server.logger.info(`Closing S3 client`)
        s3Client.destroy()
      })
    }
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

async function download(s3Client, key) {
  const logger = createLogger()
  const awsConfig = config.get('aws')

  logger.info(`downloading ${key} from bucket ${awsConfig.bucketName}`)

  const input = {
    Bucket: awsConfig.bucketName,
    Key: key
  }

  const getCommand = new GetObjectCommand(input)
  let data
  try {
    data = await s3Client.send(getCommand)
  } catch (err) {
    logger.error('Failed to get file from S3', err)
    return []
  }

  logger.info('download complete')

  return JSON.parse(await streamToString(data.Body))
}

async function upload(s3Client, key, data) {
  const logger = createLogger()
  const awsConfig = config.get('aws')

  logger.info(`uploading ${key} to bucket ${awsConfig.bucketName}`)

  const input = {
    Body: data,
    Bucket: awsConfig.bucketName,
    Key: key
  }
  const command = new PutObjectCommand(input)
  const result = await s3Client.send(command).catch((err) => {
    logger.error(err, 'Upload failed')
    return false
  })
  logger.info('Upload complete')
  return result
}

export { s3ClientPlugin, download, upload }
