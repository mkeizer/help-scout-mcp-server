// auth-middleware.ts — bearer-token gate for the HTTP MCP transport.
//
// When the server is started in HTTP mode (MCP_HTTP_PORT set), every
// POST /mcp request must carry an `Authorization: Bearer <token>` header
// matching a value in the HSMCP_BEARER_TOKENS env (comma-separated, supports
// multi-token rotation). On miss the request is rejected with HTTP 401.

import type { IncomingMessage, ServerResponse } from 'node:http';
import { logger } from './logger.js';

export function loadAcceptedTokens(): Set<string> {
  const csv = (process.env.HSMCP_BEARER_TOKENS || '').trim();
  if (!csv) return new Set();
  return new Set(
    csv
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0),
  );
}

export function authorizeRequest(
  req: IncomingMessage,
  res: ServerResponse,
  acceptedTokens: Set<string>,
): boolean {
  if (acceptedTokens.size === 0) {
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'auth_not_configured', message: 'HSMCP_BEARER_TOKENS not set' }));
    logger.error('auth: HSMCP_BEARER_TOKENS not configured');
    return false;
  }

  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    res.statusCode = 401;
    res.setHeader('content-type', 'application/json');
    res.setHeader('www-authenticate', 'Bearer');
    res.end(JSON.stringify({ error: 'unauthorized', message: 'missing or malformed Authorization: Bearer header' }));
    return false;
  }

  if (!acceptedTokens.has(match[1].trim())) {
    res.statusCode = 401;
    res.setHeader('content-type', 'application/json');
    res.setHeader('www-authenticate', 'Bearer');
    res.end(JSON.stringify({ error: 'unauthorized', message: 'invalid bearer token' }));
    const tokenPreview = match[1].slice(0, 6) + '...';
    logger.warn('auth: rejected request with invalid bearer token', { tokenPreview });
    return false;
  }

  return true;
}
