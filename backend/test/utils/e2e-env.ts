/**
 * Environment of the end-to-end tests. DATABASE_URL defaults to the
 * `insignia_test` database created by the root docker-compose.yml and can be
 * overridden with TEST_DATABASE_URL.
 */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://insignia:insignia@localhost:5432/insignia_test?schema=public';

Object.assign(process.env, {
  DATABASE_URL: TEST_DATABASE_URL,
  JWT_SECRET: 'e2e-test-secret-of-sufficient-length',
  JWT_EXPIRES_IN: '1h',
  CORS_ORIGINS: 'http://localhost:5173',
});
