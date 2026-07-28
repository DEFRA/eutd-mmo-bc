# eutd-mmo-bc

Core delivery platform Node.js Frontend Template..

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Redis](#redis)
- [Server-side Caching](#server-side-caching)
- [Authentication](#authentication)
  - [Azure AD Authentication (Production)](#azure-ad-authentication-production)
  - [Legacy Authentication (Development)](#legacy-authentication-development)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Local JSON API](#local-json-api)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [Docker](#docker)
  - [Development Image](#development-image)
  - [Production Image](#production-image)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd eutd-mmo-bc
nvm use
```

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

Redis has been **enabled** in newly created services by setting the `redis.enabled` property to `true`. If your service does not require a session cache to be shared between instances or if you don't require Redis, you can disable Redis by setting this property to `false`.

## Server-side Caching

We use Catbox for server-side caching. Specifically CatboxRedis, the Redis adapter for CatBox. It is important that in memory caching isn't used for server-side caching as this will cause issues when there is more than one instance of your service running. Server-side caching has been **enabled** in newly created services by setting the `redis.enabled` property to `true`. Please see [Redis](#redis) for more information.

## Authentication

The application uses **Azure AD OAuth2/OpenID Connect** for all environments (development, testing, and production), providing enterprise-grade security, Single Sign-On (SSO), and audit compliance.

### Features

- OAuth 2.0 / OpenID Connect flow
- JWT token validation with automatic expiration checking
- Redis-backed distributed session management (required)
- Role-based access control (RBAC) via Azure AD groups
- Multi-factor authentication support (via Azure AD policies)
- Centralized user management
- Single Sign-On (SSO) across services

### Configuration

**Required environment variables:**

```bash
BASE_URL=http://localhost:3000  # Or your deployment URL
AAD_CLIENTID=your-azure-ad-application-client-id
AAD_CLIENTSECRET=your-azure-ad-client-secret
AAD_TENANTID=your-azure-ad-tenant-id
COOKIE_PASSWORD=generate-a-secure-60-character-password

# Redis is required for distributed session management
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
```

### Azure AD Setup Steps

1. **Register the application** in Azure AD:

   - Go to Azure Portal → Azure Active Directory → App registrations
   - Create a new registration with name `mmo-bc-admin`
   - Set Redirect URI: `http://localhost:3000/auth/openid/return` (for development) or `https://your-app.domain.com/auth/openid/return` (for production)
   - Note the Application (client) ID and Tenant ID

2. **Create a client secret**:

   - In your app registration, go to Certificates & secrets
   - Create a new client secret
   - Copy the secret value immediately (it won't be shown again)

3. **Configure API permissions** (optional):

   - Add Microsoft Graph permissions if you need user profile data
   - Grant admin consent for the tenant

4. **Assign users/groups**:

   - Go to Enterprise Applications → Your app → Users and groups
   - Assign Azure AD users or groups that should have access

5. **Configure role claims** (optional):
   - Define app roles in the app manifest
   - Assign roles to users/groups
   - Roles will be available in `claims.roles[]`

### Authentication Flow

1. Unauthenticated user accesses protected route → Redirected to `/login/out`
2. Application redirects to Azure AD login portal
3. User authenticates (with MFA if configured)
4. Azure AD returns authorization code to `/auth/openid/return`
5. Application exchanges code for JWT tokens
6. Token and claims stored in Redis cache (24-hour TTL)
7. Lightweight cookie set with user identity
8. Every request validates JWT expiration from Redis

### Local Development Setup

For local development, you'll need to:

1. Create an Azure AD app registration (or use a shared dev tenant)
2. Set the redirect URI to `http://localhost:3000/auth/openid/return`
3. Configure environment variables in `.env` file
4. Ensure Redis is running locally (`redis-server` or via Docker)

**Example .env for local development:**

```bash
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
AAD_CLIENTID=your-dev-client-id
AAD_CLIENTSECRET=your-dev-client-secret
AAD_TENANTID=your-tenant-id
COOKIE_PASSWORD=local-dev-cookie-password-must-be-at-least-60-characters-long
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
```

**Note**: All team members should have access to the same Azure AD tenant for consistent development experience.

## Local Development

### Setup

Install application dependencies:

```bash
npm install
```

### Development

To run the application in `development` mode run:

```bash
npm run dev
```

### Local JSON API

Whilst the APIs are being developed this app uses a local JSON mock API. To start this locally run:

```bash
npm run mockApi
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Formatting

#### Windows prettier issue

If you are having issues with formatting of line breaks on Windows update your global git config by running:

```bash
git config --global core.autocrlf false
```

## Docker

### Development image

Build:

```bash
docker build --target development --no-cache --tag eutd-mmo-bc:development .
```

Run:

```bash
docker run -p 3000:3000 eutd-mmo-bc:development
```

### Production image

Build:

```bash
docker build --no-cache --tag eutd-mmo-bc .
```

Run:

```bash
docker run -p 3000:3000 eutd-mmo-bc
```

### Docker Compose

A local environment with:

- Localstack for AWS services (S3, SQS)
- Redis
- MongoDB
- This service.
- A commented out backend example.

```bash
docker compose up --build -d
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
