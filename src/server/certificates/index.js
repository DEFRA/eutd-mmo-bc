import Joi from 'joi'
import {
  certificatesController,
  updateCertificateDetails,
  removeCertificateDetails,
  getCertificates,
  validateCertificate
} from '~/src/server/certificates/controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const certificates = {
  plugin: {
    name: 'certificates',
    register(server) {
      server.route({
        method: 'GET',
        path: '/certificates',
        options: {
          auth: false
        },
        ...certificatesController
      })

      server.route({
        method: 'GET',
        path: '/certificates/{certificateNumber}',
        options: {
          ...validateCertificate,
          auth: false,
          description:
            'Validate an Export Certificate by providing an Certificate Number',
          plugins: {
            'hapi-swagger': {
              id: 'validateCertificate',
              responses: validHttpStatuses
            }
          },
          tags: ['api', ' Validation'],
          validate: {
            params: Joi.object({
              certificateNumber: Joi.string()
                .required()
                .description('The Certificate Number to validate')
            })
          }
        }
      })

      server.route({
        method: 'GET',
        path: '/api/certificates',
        options: {
          ...getCertificates,
          auth: 'api-key-strategy',
          description:
            'List all Export Certificates registered within the system',
          plugins: {
            'hapi-swagger': {
              responses: getHttpStatuses,
              id: 'listCertificate'
            }
          },
          tags: ['api', 'Register Management']
        }
      })

      server.route({
        method: 'PUT',
        path: '/api/certificates/{certificateNumber}',
        options: {
          ...updateCertificateDetails,
          auth: 'api-key-strategy',
          description: 'Include details of an Export Certificate',
          notes: 'The Certificate Number to include',
          plugins: {
            'hapi-swagger': {
              responses: httpStatuses,
              id: 'includeCertificateDetails'
            }
          },
          tags: ['api', 'Register Management'],
          validate: {
            params: Joi.object({
              certificateNumber: Joi.string().required()
            }),
            payload: Joi.object({
              certNumber: Joi.string()
                .description('An Export Certificate Number')
                .example('GBR-2018-CC-123A4BC56'),
              timestamp: Joi.string()
                .isoDate()
                .description(
                  'The Export Certificate issue date in ISO8601 format'
                )
                .example('2019-07-07T13:53:40.257Z'),
              status: Joi.string().example('COMPLETE')
            })
          }
        }
      })

      server.route({
        method: 'DELETE',
        path: '/api/certificates/{certificateNumber}',
        options: {
          ...removeCertificateDetails,
          auth: 'api-key-strategy',
          description: 'Remove details of an Export Certificate',
          notes: 'The Certificate Number to include',
          plugins: {
            'hapi-swagger': {
              responses: httpStatuses,
              payloadType: 'form',
              id: 'removeCertificateDetails'
            }
          },
          tags: ['api', 'Register Management'],
          validate: {
            params: Joi.object({
              certificateNumber: Joi.string().required()
            })
          }
        }
      })
    }
  }
}

const exportCertificateDetailsModel = Joi.object({
  certNumber: Joi.string()
    .required()
    .description('An Export Certificate Number')
    .example('GBR-2018-CC-123A4BC56'),
  timestamp: Joi.string()
    .isoDate()
    .description('The Export Certificate issue date in ISO8601 format')
    .example('2019-07-07T13:53:40.257Z'),
  status: Joi.string().required().example("enum: ['DRAFT', 'COMPLETE', 'VOID']")
})
  .label('ExportCertificateDetails')
  .description('Details of an Export Certificate to store')

const successMessageModel = Joi.object({
  message: Joi.string().required().example('SUCCESS')
}).label('Success response')

const validResponseModel = Joi.object({
  certNumber: Joi.string()
    .required()
    .description('An Export Certificate Number')
    .example('GBR-2018-CC-123A4BC56'),
  timestamp: Joi.string()
    .isoDate()
    .description('The Export Certificate issue date in ISO8601 format')
    .example('2019-07-07T13:53:40.257Z'),
  status: Joi.string()
    .required()
    .example("enum: ['DRAFT', 'COMPLETE', 'VOID']"),
  isValid: Joi.boolean().required().example('true')
}).label('Validation response')

const errorModel = Joi.object({
  code: Joi.number().required(),
  message: Joi.string().required(),
  stack: Joi.string()
})
  .label('Error')
  .description('Error')

const getHttpStatuses = {
  200: {
    description: 'Successful',
    schema: exportCertificateDetailsModel
  },
  400: {
    description: 'Invalid parameters',
    schema: errorModel
  },
  401: {
    description: ' API key is missing or invalid',
    headers: { WWW_Authenticate: { schema: { type: 'string' } } },
    schema: errorModel
  },
  500: {
    description: 'An error occurred while performing the operation',
    schema: errorModel
  }
}

const httpStatuses = {
  200: {
    description: 'Successful',
    schema: successMessageModel
  },
  400: {
    description: 'Invalid parameters',
    schema: errorModel
  },
  401: {
    description: ' API key is missing or invalid',
    headers: { WWW_Authenticate: { schema: { type: 'string' } } },
    schema: errorModel
  },
  500: {
    description: 'An error occurred while performing the operation',
    schema: errorModel
  }
}

const validHttpStatuses = {
  200: {
    description: 'Successful',
    schema: validResponseModel
  },
  400: {
    description: 'Invalid parameters',
    schema: errorModel
  },
  401: {
    description: ' API key is missing or invalid',
    headers: { WWW_Authenticate: { schema: { type: 'string' } } },
    schema: errorModel
  },
  500: {
    description: 'An error occurred while performing the operation',
    schema: errorModel
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
