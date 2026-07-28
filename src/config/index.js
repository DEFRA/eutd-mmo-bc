import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const dirname = path.dirname(fileURLToPath(import.meta.url))

const oneHour = 1000 * 60 * 60
const fourHours = oneHour * 4
const oneWeekMillis = oneHour * 24 * 7

export const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: oneWeekMillis,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'Check an Export Certificate'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.resolve(dirname, '../..')
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: '/public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  httpProxy: /** @type {SchemaObj<string | null>} */ ({
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTP_PROXY'
  }),
  httpsProxy: /** @type {SchemaObj<string | null>} */ ({
    doc: 'HTTPS Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTPS_PROXY'
  }),
  session: {
    cache: {
      name: {
        doc: 'server side session cache name',
        format: String,
        default: 'session',
        env: 'SESSION_CACHE_NAME'
      },
      ttl: {
        doc: 'server side session cache ttl',
        format: Number,
        default: fourHours,
        env: 'SESSION_CACHE_TTL'
      }
    },
    cookie: {
      ttl: {
        doc: 'Session cookie ttl',
        format: Number,
        default: fourHours,
        env: 'SESSION_COOKIE_TTL'
      },
      password: {
        doc: 'session cookie password',
        format: String,
        default: 'the-password-must-be-at-least-32-characters-long',
        env: 'SESSION_COOKIE_PASSWORD',
        sensitive: true
      }
    }
  },
  redis: /** @type {Schema<RedisConfig>} */ ({
    enabled: {
      doc: 'Enable Redis on your Frontend.',
      format: Boolean,
      default: true,
      env: 'REDIS_ENABLED'
    },
    host: {
      doc: 'Redis cache host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_HOST'
    },
    username: {
      doc: 'Redis cache username',
      format: String,
      default: '',
      env: 'REDIS_USERNAME'
    },
    password: {
      doc: 'Redis cache password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'REDIS_PASSWORD'
    },
    keyPrefix: {
      doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
      format: String,
      default: 'eutd-mmo-bc:',
      env: 'REDIS_KEY_PREFIX'
    },
    useSingleInstanceCache: {
      doc: 'Enable the use of a single instance Redis Cache',
      format: Boolean,
      default: process.env.NODE_ENV !== 'production',
      env: 'USE_SINGLE_INSTANCE_CACHE'
    }
  }),
  authCookiePassword: /** @type {SchemaObj<string | null>} */ ({
    doc: 'Password for the auth cookie',
    format: String,
    nullable: true,
    default: 'the-password-must-be-at-least-60-characters-long',
    env: 'COOKIE_PASSWORD'
  }),
  baseUrl: {
    doc: 'Base URL for the application',
    format: String,
    default: 'http://localhost:3000',
    env: 'BASE_URL'
  },
  azureAd: {
    enabled: {
      doc: 'Enable Azure AD authentication (always true)',
      format: Boolean,
      default: true,
      env: 'AZURE_AD_ENABLED'
    },
    clientId: {
      doc: 'Azure AD application (client) ID',
      format: String,
      default: '',
      env: 'AAD_CLIENTID'
    },
    clientSecret: {
      doc: 'Azure AD client secret',
      format: String,
      default: '',
      sensitive: true,
      env: 'AAD_CLIENTSECRET'
    },
    tenantId: {
      doc: 'Azure AD tenant ID',
      format: String,
      default: '',
      env: 'AAD_TENANTID'
    },
    cookieName: {
      doc: 'Name of the Azure AD authentication cookie',
      format: String,
      default: 'bc-admin-auth'
    }
  },
  aws: /** @type {SchemaObj<string | null>} */ ({
    region: {
      doc: 'AWS region',
      format: String,
      default: 'eu-west-2',
      env: 'AWS_BUCKET_REGION'
    },
    bucketName: {
      doc: 'AWS bucket name',
      format: String,
      default: 'mmo-check-exp-cert-dev',
      env: 'EXPORT_CERTIFICATES_BUCKET'
    },
    s3Endpoint: {
      doc: 'AWS S3 endpoint',
      format: String,
      default: 'http://localhost:4566',
      env: 'S3_ENDPOINT'
    }
  }),
  apiAuth: {
    doc: 'Used to authenticate API requests',
    format: String,
    default: '00000000-0000-1000-A000-000000000000',
    env: 'API_AUTH_TOKEN'
  }
})

config.validate({ allowed: 'strict' })

/**
 * @import { Schema, SchemaObj } from 'convict'
 * @import { RedisConfig } from '~/src/server/common/helpers/redis-client.js'
 */
