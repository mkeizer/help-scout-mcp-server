// oauth.ts — Flow A: de MCP-kant. Wij zijn authorization server + resource
// server in één, conform de MCP-autorisatiespec (2025-06-18+):
//   - RFC 9728 protected-resource-metadata (zodat clients ons AS vinden)
//   - RFC 8414 authorization-server-metadata
//   - RFC 7591 dynamic client registration (claude.ai registreert zichzelf)
//   - PKCE S256 verplicht; geen client_secrets (public clients)
//   - RFC 7009 revocation
//
// /oauth/authorize stuurt de gebruiker door Help Scout's eigen consent
// (Flow B, hs-oauth.ts) en koppelt daarna de uitgegeven code aan diens
// user-record. Er is dus geen eigen login of wachtwoord — Help Scout ÍS de
// identiteit.
import { randomBytes } from 'node:crypto';
import { saasConfig } from './config.js';
import { newToken, pkceS256 } from './crypto.js';
import { saveClient, getClient, saveGrant, consumeGrant, lookupGrant, revokeToken, saveFlowState, consumeFlowState, audit, } from './store.js';
import { buildHsAuthorizeUrl, completeHsLink } from './hs-oauth.js';
import { logger } from '../utils/logger.js';
const CODE_TTL = 120; // s — autorisatiecodes zijn kort en single-use
const ACCESS_TTL = 3600; // 1 uur
const REFRESH_TTL = 90 * 86400; // 90 dagen
const SCOPES = ['read', 'write'];
// ── kleine http-helpers ────────────────────────────────────────────────────
function sendJson(res, status, body) {
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify(body));
}
function sendHtml(res, status, html) {
    res.statusCode = status;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;max-width:34rem;margin:4rem auto;line-height:1.5">${html}</body>`);
}
function redirect(res, location) {
    res.statusCode = 302;
    res.setHeader('location', location);
    res.end();
}
async function readJsonBody(req) {
    const chunks = [];
    for await (const c of req)
        chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw)
        return {};
    const ct = String(req.headers['content-type'] || '');
    if (ct.includes('application/x-www-form-urlencoded')) {
        return Object.fromEntries(new URLSearchParams(raw));
    }
    return JSON.parse(raw);
}
// ── metadata-endpoints ─────────────────────────────────────────────────────
export function protectedResourceMetadata() {
    return {
        resource: saasConfig.publicBaseUrl,
        authorization_servers: [saasConfig.publicBaseUrl],
        scopes_supported: [...SCOPES],
        bearer_methods_supported: ['header'],
    };
}
export function authorizationServerMetadata() {
    const b = saasConfig.publicBaseUrl;
    return {
        issuer: b,
        authorization_endpoint: `${b}/oauth/authorize`,
        token_endpoint: `${b}/oauth/token`,
        registration_endpoint: `${b}/oauth/register`,
        revocation_endpoint: `${b}/oauth/revoke`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['none'],
        scopes_supported: [...SCOPES],
    };
}
// ── route-afhandeling ──────────────────────────────────────────────────────
/**
 * Behandelt alle SaaS-OAuth-paden. Retourneert true als het pad van ons was.
 */
export async function handleOauthRoute(req, res) {
    const url = new URL(req.url || '/', saasConfig.publicBaseUrl);
    const path = url.pathname;
    try {
        if (path === '/.well-known/oauth-protected-resource' || path.startsWith('/.well-known/oauth-protected-resource/')) {
            sendJson(res, 200, protectedResourceMetadata());
            return true;
        }
        if (path === '/.well-known/oauth-authorization-server' || path.startsWith('/.well-known/oauth-authorization-server/')) {
            sendJson(res, 200, authorizationServerMetadata());
            return true;
        }
        if (path === '/oauth/register' && req.method === 'POST') {
            await handleRegister(req, res);
            return true;
        }
        if (path === '/oauth/authorize' && req.method === 'GET') {
            handleAuthorize(url, res);
            return true;
        }
        if (path === '/oauth/hs/callback' && req.method === 'GET') {
            await handleHsCallback(url, res);
            return true;
        }
        if (path === '/oauth/token' && req.method === 'POST') {
            await handleToken(req, res);
            return true;
        }
        if (path === '/oauth/revoke' && req.method === 'POST') {
            await handleRevoke(req, res);
            return true;
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('saas oauth error', { path, error: msg });
        if (!res.headersSent)
            sendJson(res, 500, { error: 'server_error', error_description: msg });
        return true;
    }
    return false;
}
// RFC 7591 — claude.ai registreert zichzelf met naam + redirect_uris.
async function handleRegister(req, res) {
    const body = await readJsonBody(req);
    const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.map(String) : [];
    if (redirectUris.length === 0) {
        sendJson(res, 400, { error: 'invalid_client_metadata', error_description: 'redirect_uris required' });
        return;
    }
    if (!redirectUris.every(u => u.startsWith('https://') || u.startsWith('http://localhost') || u.startsWith('http://127.0.0.1'))) {
        sendJson(res, 400, { error: 'invalid_redirect_uri', error_description: 'redirect_uris must be https (or localhost for dev)' });
        return;
    }
    const clientId = `hsmcp_client_${randomBytes(12).toString('hex')}`;
    saveClient({
        client_id: clientId,
        client_name: String(body.client_name || 'unnamed MCP client'),
        redirect_uris: redirectUris,
    });
    audit(null, 'client_registered', clientId);
    sendJson(res, 201, {
        client_id: clientId,
        client_name: body.client_name,
        redirect_uris: redirectUris,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
    });
}
// /oauth/authorize → parkeer de hele request in flow-state → door naar Help Scout.
function handleAuthorize(url, res) {
    const q = url.searchParams;
    const clientId = q.get('client_id') || '';
    const redirectUri = q.get('redirect_uri') || '';
    const state = q.get('state') || '';
    const codeChallenge = q.get('code_challenge') || '';
    const challengeMethod = q.get('code_challenge_method') || '';
    const scope = (q.get('scope') || 'read').split(/[\s+]+/).filter(s => SCOPES.includes(s)).join(' ') || 'read';
    const client = getClient(clientId);
    if (!client) {
        sendHtml(res, 400, '<h2>Unknown client</h2><p>This MCP client is not registered.</p>');
        return;
    }
    if (!client.redirect_uris.includes(redirectUri)) {
        // Exact-match — nooit terug-redirecten naar een niet-geregistreerde URI
        sendHtml(res, 400, '<h2>Invalid redirect_uri</h2>');
        return;
    }
    if (challengeMethod !== 'S256' || !codeChallenge) {
        redirect(res, `${redirectUri}?error=invalid_request&error_description=${encodeURIComponent('PKCE S256 required')}${state ? `&state=${encodeURIComponent(state)}` : ''}`);
        return;
    }
    if (scope.includes('write') && !saasConfig.allowWriteScope) {
        redirect(res, `${redirectUri}?error=invalid_scope&error_description=${encodeURIComponent('write scope is not enabled on this server')}${state ? `&state=${encodeURIComponent(state)}` : ''}`);
        return;
    }
    const hsState = randomBytes(16).toString('hex');
    saveFlowState(hsState, { clientId, redirectUri, state, codeChallenge, scope });
    redirect(res, buildHsAuthorizeUrl(hsState));
}
// Help Scout komt hier terug; we ronden Flow B af en geven onze eigen code uit.
async function handleHsCallback(url, res) {
    const code = url.searchParams.get('code');
    const hsState = url.searchParams.get('state') || '';
    const flow = consumeFlowState(hsState);
    if (!flow || !code) {
        sendHtml(res, 400, '<h2>Koppeling mislukt</h2><p>Ongeldige of verlopen autorisatie-sessie. Begin opnieuw vanuit je MCP-client.</p>');
        return;
    }
    let user;
    try {
        user = await completeHsLink(code);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendHtml(res, 403, `<h2>Geen toegang</h2><p>${msg.replace(/</g, '&lt;')}</p>`);
        return;
    }
    const ourCode = newToken('hsmcp_code');
    saveGrant({
        kind: 'code',
        token: ourCode,
        client_id: String(flow.clientId),
        user_id: user.id,
        scope: String(flow.scope || 'read'),
        pkce_challenge: String(flow.codeChallenge),
        redirect_uri: String(flow.redirectUri),
        expires_at: Math.floor(Date.now() / 1000) + CODE_TTL,
    });
    audit(user.id, 'authorize_ok', String(flow.clientId));
    const target = new URL(String(flow.redirectUri));
    target.searchParams.set('code', ourCode);
    if (flow.state)
        target.searchParams.set('state', String(flow.state));
    redirect(res, target.toString());
}
async function handleToken(req, res) {
    const body = await readJsonBody(req);
    const grantType = String(body.grant_type || '');
    if (grantType === 'authorization_code') {
        const code = String(body.code || '');
        const verifier = String(body.code_verifier || '');
        const grant = consumeGrant('code', code);
        if (!grant) {
            sendJson(res, 400, { error: 'invalid_grant', error_description: 'unknown, expired or reused code' });
            return;
        }
        if (String(body.client_id || '') !== grant.client_id || String(body.redirect_uri || '') !== grant.redirect_uri) {
            sendJson(res, 400, { error: 'invalid_grant', error_description: 'client_id/redirect_uri mismatch' });
            return;
        }
        if (!verifier || pkceS256(verifier) !== grant.pkce_challenge) {
            sendJson(res, 400, { error: 'invalid_grant', error_description: 'PKCE verification failed' });
            return;
        }
        issueTokens(res, grant.client_id, grant.user_id, grant.scope);
        return;
    }
    if (grantType === 'refresh_token') {
        const refresh = String(body.refresh_token || '');
        const grant = lookupGrant('refresh', refresh);
        if (!grant) {
            sendJson(res, 400, { error: 'invalid_grant', error_description: 'unknown or expired refresh token' });
            return;
        }
        // Rotatie: oude refresh intrekken, nieuw paar uitgeven
        revokeToken(refresh);
        issueTokens(res, grant.client_id, grant.user_id, grant.scope);
        return;
    }
    sendJson(res, 400, { error: 'unsupported_grant_type' });
}
function issueTokens(res, clientId, userId, scope) {
    const access = newToken('hsmcp_at');
    const refresh = newToken('hsmcp_rt');
    const now = Math.floor(Date.now() / 1000);
    saveGrant({ kind: 'access', token: access, client_id: clientId, user_id: userId, scope, pkce_challenge: null, redirect_uri: null, expires_at: now + ACCESS_TTL });
    saveGrant({ kind: 'refresh', token: refresh, client_id: clientId, user_id: userId, scope, pkce_challenge: null, redirect_uri: null, expires_at: now + REFRESH_TTL });
    audit(userId, 'tokens_issued', clientId);
    sendJson(res, 200, {
        access_token: access,
        token_type: 'Bearer',
        expires_in: ACCESS_TTL,
        refresh_token: refresh,
        scope,
    });
}
async function handleRevoke(req, res) {
    const body = await readJsonBody(req);
    const token = String(body.token || '');
    if (token)
        revokeToken(token);
    // RFC 7009: altijd 200, ook voor onbekende tokens
    sendJson(res, 200, {});
}
/**
 * Valideer een OAuth-access-token. Retourneert principal of null.
 * (De 401-respons met resource_metadata doet de caller — die weet of er ook
 * nog een legacy-bearer-lijst is om te proberen.)
 */
export function authenticateOauthToken(token) {
    if (!token.startsWith('hsmcp_at_'))
        return null;
    const grant = lookupGrant('access', token);
    if (!grant)
        return null;
    return { userId: grant.user_id, scope: grant.scope };
}
export function send401WithResourceMetadata(res) {
    res.statusCode = 401;
    res.setHeader('content-type', 'application/json');
    res.setHeader('www-authenticate', `Bearer resource_metadata="${saasConfig.publicBaseUrl}/.well-known/oauth-protected-resource"`);
    res.end(JSON.stringify({ error: 'unauthorized', message: 'OAuth bearer token required' }));
}
//# sourceMappingURL=oauth.js.map