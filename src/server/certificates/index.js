import Joi from 'joi'
import {
  certificatesController,
  updateCertificateDetails,
  removeCertificateDetails,
  getCertificates
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
        path: '/api/certificates',
        options: {
          ...getCertificates,
          auth: 'api-key-strategy',
          description: 'List all Export Certificates registered within the system',
          plugins: {
            'hapi-swagger': {
              responses: httpStatuses,
              id: 'listCertificate'
          }},
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
              id: 'includeCertificateDetails',
              produces: ['application/json']
          }
          },
          tags: ['api', 'Register Management'],
          validate: {
            params: Joi.object({
              certificateNumber: Joi.string().required()
            }),
            payload: Joi.object({
              certNumber: Joi.string().required().description('An Export Certificate Number').example('GBR-2018-CC-123A4BC56'),
              timestamp: Joi.string().isoDate().description('The Export Certificate issue date in ISO8601 format').example('2019-07-07T13:53:40.257Z'),
              status: Joi.string().required().example('COMPLETE')
            })
          }
        },
      })

      server.route({
        method: 'DELETE',
        path: '/api/certificates/{certificateNumber}',
        options: {
          auth: 'api-key-strategy',
          description: 'Remove details of an Export Certificate',
          notes: 'The Certificate Number to include',
          plugins: {
            'hapi-swagger': {
              responses: httpStatuses,
              payloadType: 'form',
              id: 'removeCertificateDetails'
          }},
          tags: ['api', 'Register Management'],
          validate: {
            params: Joi.object({
              certNumber: Joi.string().required()
            })
          }
        },
        ...removeCertificateDetails
      })
    }
  }
}

const exportCertificateDetailsModel = Joi.object({
  certNumber: Joi.string().required().description('An Export Certificate Number').example('GBR-2018-CC-123A4BC56'),
  timestamp: Joi.string().isoDate().description('The Export Certificate issue date in ISO8601 format').example('2019-07-07T13:53:40.257Z'),  
  status: Joi.string().required().example("enum: ['DRAFT', 'COMPLETE', 'VOID']")
}).label('ExportCertificateDetails').description('Details of an Export Certificate to store');

const errorModel = Joi.object({
  code: Joi.number().required(),
  message: Joi.string().required(),
  stack: Joi.string()
}).label('Error').description('Error');

const httpStatuses = {
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

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
