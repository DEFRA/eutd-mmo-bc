import Joi from 'joi'
import {
  certificatesController,
  updateCertificateDetails,
  removeCertificateDetails,
  getCertificates,
  validateCertificate
} from '~/src/server/certificates/controller.js'

const apiKeyAuthStrategy = 'api-key-strategy'
const apiTags = ['api', 'Register Management']
const certNumberJoi = Joi.string()
  .required()
  .description('An Export Certificate Number')
  .example('GBR-2018-CC-123A4BC56')
const timestampJoi = Joi.string()
  .isoDate()
  .description('The Export Certificate issue date in ISO8601 format')
  .example('2019-07-07T13:53:40.257Z')
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
          auth: apiKeyAuthStrategy,
          description:
            'List all Export Certificates registered within the system',
          plugins: {
            'hapi-swagger': {
              responses: getHttpStatuses,
              id: 'listCertificate'
            }
          },
          tags: apiTags
        }
      })

      server.route({
        method: 'PUT',
        path: '/api/certificates/{certificateNumber}',
        options: {
          ...updateCertificateDetails,
          auth: apiKeyAuthStrategy,
          description: 'Include details of an Export Certificate',
          notes: 'The Certificate Number to include',
          plugins: {
            'hapi-swagger': {
              responses: httpStatuses,
              id: 'includeCertificateDetails'
            }
          },
          tags: apiTags,
          validate: {
            params: Joi.object({
              certificateNumber: Joi.string().required()
            }),
            payload: Joi.object({
              certNumber: certNumberJoi,
              timestamp: timestampJoi,
              status: Joi.string().example('DRAFT')
            }).label('Paylod')
          }
        }
      })

      server.route({
        method: 'DELETE',
        path: '/api/certificates/{certificateNumber}',
        options: {
          ...removeCertificateDetails,
          auth: apiKeyAuthStrategy,
          description: 'Remove details of an Export Certificate',
          notes: 'The Certificate Number to include',
          plugins: {
            'hapi-swagger': {
              responses: httpStatuses,
              payloadType: 'form',
              id: 'removeCertificateDetails'
            }
          },
          tags: apiTags,
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
  certNumber: certNumberJoi,
  timestamp: timestampJoi,
  status: Joi.string().required().example("enum: ['DRAFT', 'COMPLETE', 'VOID']")
})
  .label('ExportCertificateDetails')
  .description('Details of an Export Certificate to store')

const successMessageModel = Joi.object({
  message: Joi.string().required().example('SUCCESS')
}).label('Success response')

const validResponseModel = Joi.object({
  certNumber: certNumberJoi,
  timestamp: timestampJoi,
  status: Joi.string()
    .required()
    .example("enum: ['DRAFT', 'COMPLETE', 'VOID']"),
  isValid: Joi.boolean().required().example('true')
}).label('ExportCertificateValidity')

const errorModel = Joi.object({
  code: Joi.number().required(),
  message: Joi.string().required(),
  stack: Joi.string()
})
  .label('Error')
  .description('Error')

const invalidParamsError = {
  description: 'Invalid parameters',
  schema: errorModel
}

const apiKeyError = {
  description: ' API key is missing or invalid',
  headers: { WWW_Authenticate: { schema: { type: 'string' } } },
  schema: errorModel
}

const serverError = {
  description: 'An error occurred while performing the operation',
  schema: errorModel
}

const getHttpStatuses = {
  200: {
    description: 'Successful',
    schema: exportCertificateDetailsModel
  },
  400: invalidParamsError,
  401: apiKeyError,
  500: serverError
}

const httpStatuses = {
  200: {
    description: 'Successful',
    schema: successMessageModel
  },
  400: invalidParamsError,
  401: apiKeyError,
  500: serverError
}

const validHttpStatuses = {
  200: {
    description: 'Successful',
    schema: validResponseModel
  },
  400: invalidParamsError,
  401: apiKeyError,
  500: serverError
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
