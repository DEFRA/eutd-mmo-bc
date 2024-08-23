import {
  download,
  upload
} from '~/src/server/common/helpers/repository/S3Bucket.js'
import { Stream } from 'stream'

describe('#S3Bucket', () => {
  const updatedJson = [
    {
      certNumber: 'GBR-2024-CC-123A4AW06',
      status: 'COMPLETE',
      timestamp: '2024-05-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW03',
      status: 'DRAFT',
      timestamp: '2024-07-06T00:00:00.000Z'
    },
    {
      certNumber: 'GBR-2024-CC-123A4AW02',
      timestamp: '2024-05-06T00:00:00.000Z',
      status: 'DRAFT'
    }
  ]

  test('Should download a file from the S3 bucket', async () => {
    const Readable = Stream.Readable
    const stream = new Readable()
    stream.push(
      '[{"certNumber":"GBR-2024-CC-123A4AW06","timestamp":"2024-05-06T00:00:00.000Z","status":"COMPLETE"},{"certNumber":"GBR-2024-CC-123A4AW03","timestamp":"2024-07-06T00:00:00.000Z","status":"DRAFT"}]'
    )
    stream.push(null)

    const s3Client = {
      send: jest.fn().mockResolvedValue({
        Body: stream
      })
    }
    const response = await download(s3Client, 'ecert_certificates.json')
    expect(s3Client.send.mock.calls[0][0].input).toStrictEqual({
      Bucket: 'mmo-check-exp-cert-dev',
      Key: 'ecert_certificates.json'
    })
    expect(response).toStrictEqual([
      {
        certNumber: 'GBR-2024-CC-123A4AW06',
        status: 'COMPLETE',
        timestamp: '2024-05-06T00:00:00.000Z'
      },
      {
        certNumber: 'GBR-2024-CC-123A4AW03',
        status: 'DRAFT',
        timestamp: '2024-07-06T00:00:00.000Z'
      }
    ])
  })

  test('Should return an empty array if there was an error with downloading from S3', async () => {
    const s3Client = {
      send: jest.fn().mockRejectedValue('error')
    }
    const response = await download(s3Client, 'ecert_certificates.json')
    expect(s3Client.send.mock.calls[0][0].input).toStrictEqual({
      Bucket: 'mmo-check-exp-cert-dev',
      Key: 'ecert_certificates.json'
    })
    expect(response).toStrictEqual([])
  })

  test('Should upload a file from the S3 bucket', async () => {
    const s3Client = {
      send: jest.fn().mockResolvedValue('success')
    }
    const response = await upload(
      s3Client,
      'ecert_certificates.json',
      updatedJson
    )
    expect(s3Client.send.mock.calls[0][0].input).toStrictEqual({
      Bucket: 'mmo-check-exp-cert-dev',
      Key: 'ecert_certificates.json',
      Body: updatedJson
    })
    expect(response).toBe('success')
  })

  test('Should return false if there was an error uploading to S3', async () => {
    const s3Client = {
      send: jest.fn().mockRejectedValue('error')
    }
    const response = await upload(
      s3Client,
      'ecert_certificates.json',
      updatedJson
    )
    expect(s3Client.send.mock.calls[0][0].input).toStrictEqual({
      Bucket: 'mmo-check-exp-cert-dev',
      Key: 'ecert_certificates.json',
      Body: updatedJson
    })
    expect(response).toBeFalsy()
  })
})
