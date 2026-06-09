import * as Sentry from '@sentry/node';
import { config } from './config.js';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: 0.2,

  // Debug logs (disable in production later if noisy)
  enableLogs: true,

  // Useful for debugging real users in production
  sendDefaultPii: true,

  // Release tracking (optional but recommended)
  release: config.RELEASE || 'retreat-backend@dev',
});

console.log('✅ Sentry initialized');

export default Sentry;
