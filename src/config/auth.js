export const cookieConfig = {
  cookie: {
    name: 'session-auth',
    password: process.env.COOKIE_PASSWORD,
    isSecure: process.env.NODE_ENV === 'production'
  },
  enabled: process.env.LOGIN_REQUIRED === 'true'
}
