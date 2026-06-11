// context.ts — per-request context voor multi-tenant werking.
//
// De bestaande tools/resources/reports importeren `helpScoutClient` als
// module-singleton. In SaaS-mode draait elke /mcp-request binnen
// requestContext.run(...), en levert de Proxy-export in helpscout-client.ts
// transparant de juiste per-user client. Buiten een context (stdio-mode,
// legacy bearer-mode) valt alles terug op de singleton — nul gedragswijziging.

import { HelpScoutClient } from '../utils/helpscout-client.js';
import { validHsAccessToken } from './hs-oauth.js';
import { config } from '../utils/config.js';

export { requestContext, type RequestContext } from './als.js';

// Warme clients per user hergebruiken (connection pools zijn niet gratis).
const clientPool = new Map<number, HelpScoutClient>();
const CLIENT_POOL_MAX = 100;

export function clientForUser(userId: number): HelpScoutClient {
  let client = clientPool.get(userId);
  if (client) return client;

  client = new HelpScoutClient(config.connectionPool, {
    // Lazy refresh zit in validHsAccessToken; null = koppeling weg → de
    // client gooit dan een UNAUTHORIZED die als nette tool-error landt.
    tokenProvider: () => validHsAccessToken(userId),
    cacheNamespace: `u${userId}`,
  });

  if (clientPool.size >= CLIENT_POOL_MAX) {
    // Simpele FIFO-evictie; bij deze schaal ruim voldoende
    const oldest = clientPool.keys().next().value;
    if (oldest !== undefined) {
      clientPool.get(oldest)?.closePool().catch(() => { /* ignore */ });
      clientPool.delete(oldest);
    }
  }
  clientPool.set(userId, client);
  return client;
}

export function dropClientForUser(userId: number): void {
  clientPool.get(userId)?.closePool().catch(() => { /* ignore */ });
  clientPool.delete(userId);
}
