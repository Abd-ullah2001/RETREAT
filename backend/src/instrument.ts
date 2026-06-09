import * as Sentry from '@sentry/node';
import { config } from './config.js';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  tracesSampleRate: 0.2,
  sendDefaultPii: true,
  release: 'retreat-backend@dev',
});

console.log('✅ Sentry initialized');

export default Sentry;

