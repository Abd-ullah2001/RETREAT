/**
 * QStash publisher — reserved for future async jobs (not used by inquiry flow).
 */
import { Client } from '@upstash/qstash';
import { config } from '../config.js';

const client = new Client({ token: config.QSTASH_TOKEN });

export async function enqueueJob(
  destination: string,
  body: object,
  delaySeconds?: number,
): Promise<string> {
  const result = await client.publishJSON({
    url: destination,
    body,
    delay: delaySeconds,
  });
  return result.messageId;
}
