/**
 * Structured logging via Pino.
 * Dev: human-readable (pino-pretty). Prod: JSON for Railway → Axiom drain.
 */
import pino from 'pino';
import { config } from '../config.js';

const isDev = config.NODE_ENV === 'development';

const logger = pino({
  level: isDev ? 'debug' : 'info',
  // Required fields for log correlation at scale
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

export default logger;

/** Child logger bound to a request — attach requestId for distributed tracing */
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}
