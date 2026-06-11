// store.ts — SQLite-persistentie voor de SaaS-laag.
//
// Eén database in saasDir (WAL). HS-tokens versleuteld via crypto.ts; alle
// eigen tokens/codes alleen als sha256-hash. Audit-log bevat geen payloads.
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { encrypt, decrypt, sha256hex } from './crypto.js';
let db;
export function initStore(saasDir) {
    db = new Database(join(saasDir, 'saas.db'));
    db.pragma('journal_mode = WAL');
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hs_user_id INTEGER NOT NULL UNIQUE,
      hs_email TEXT NOT NULL,
      hs_company_id INTEGER,
      disabled INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS hs_tokens (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      access_enc TEXT NOT NULL,
      refresh_enc TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS mcp_clients (
      client_id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      redirect_uris TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL CHECK (kind IN ('code','refresh','access')),
      token_hash TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      scope TEXT NOT NULL DEFAULT 'read',
      pkce_challenge TEXT,
      redirect_uri TEXT,
      expires_at INTEGER NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS grants_user ON grants(user_id);
    CREATE TABLE IF NOT EXISTS hs_flow_state (
      state TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL DEFAULT (unixepoch()),
      user_id INTEGER,
      event TEXT NOT NULL,
      detail TEXT,
      duration_ms INTEGER
    );
    CREATE TABLE IF NOT EXISTS rate_buckets (
      user_id INTEGER NOT NULL,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, window_start)
    );
  `);
}
// ── users + HS-tokens ──────────────────────────────────────────────────────
export function upsertUser(hsUserId, email, companyId) {
    db.prepare(`
    INSERT INTO users (hs_user_id, hs_email, hs_company_id) VALUES (?, ?, ?)
    ON CONFLICT(hs_user_id) DO UPDATE SET hs_email = excluded.hs_email, hs_company_id = excluded.hs_company_id
  `).run(hsUserId, email, companyId);
    return db.prepare('SELECT * FROM users WHERE hs_user_id = ?').get(hsUserId);
}
export function getUser(userId) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}
export function saveHsTokens(userId, t) {
    db.prepare(`
    INSERT INTO hs_tokens (user_id, access_enc, refresh_enc, expires_at, updated_at)
    VALUES (?, ?, ?, ?, unixepoch())
    ON CONFLICT(user_id) DO UPDATE SET
      access_enc = excluded.access_enc, refresh_enc = excluded.refresh_enc,
      expires_at = excluded.expires_at, updated_at = unixepoch()
  `).run(userId, encrypt(t.accessToken), encrypt(t.refreshToken), t.expiresAt);
}
export function getHsTokens(userId) {
    const row = db.prepare('SELECT * FROM hs_tokens WHERE user_id = ?').get(userId);
    if (!row)
        return null;
    return {
        accessToken: decrypt(row.access_enc),
        refreshToken: decrypt(row.refresh_enc),
        expiresAt: row.expires_at,
    };
}
export function deleteUserAuth(userId) {
    db.prepare('DELETE FROM hs_tokens WHERE user_id = ?').run(userId);
    db.prepare('UPDATE grants SET revoked = 1 WHERE user_id = ?').run(userId);
}
// ── MCP-clients (DCR) ──────────────────────────────────────────────────────
export function saveClient(c) {
    db.prepare('INSERT OR REPLACE INTO mcp_clients (client_id, client_name, redirect_uris) VALUES (?, ?, ?)')
        .run(c.client_id, c.client_name, JSON.stringify(c.redirect_uris));
}
export function getClient(clientId) {
    const row = db.prepare('SELECT * FROM mcp_clients WHERE client_id = ?').get(clientId);
    if (!row)
        return undefined;
    return { client_id: row.client_id, client_name: row.client_name, redirect_uris: JSON.parse(row.redirect_uris) };
}
// ── grants (codes / refresh / access) ──────────────────────────────────────
export function saveGrant(g) {
    db.prepare(`
    INSERT INTO grants (kind, token_hash, client_id, user_id, scope, pkce_challenge, redirect_uri, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(g.kind, sha256hex(g.token), g.client_id, g.user_id, g.scope, g.pkce_challenge, g.redirect_uri, g.expires_at);
}
export function consumeGrant(kind, token) {
    const row = db.prepare('SELECT * FROM grants WHERE kind = ? AND token_hash = ? AND revoked = 0')
        .get(kind, sha256hex(token));
    if (!row)
        return undefined;
    if (row.expires_at < Math.floor(Date.now() / 1000))
        return undefined;
    if (kind === 'code') {
        // Codes zijn single-use: meteen reviren
        db.prepare('UPDATE grants SET revoked = 1 WHERE id = ?').run(row.id);
    }
    return row;
}
export function lookupGrant(kind, token) {
    const row = db.prepare('SELECT * FROM grants WHERE kind = ? AND token_hash = ? AND revoked = 0')
        .get(kind, sha256hex(token));
    if (!row || row.expires_at < Math.floor(Date.now() / 1000))
        return undefined;
    return row;
}
export function revokeToken(token) {
    db.prepare('UPDATE grants SET revoked = 1 WHERE token_hash = ?').run(sha256hex(token));
}
// ── HS-flow-state (state-parameter Flow B) ─────────────────────────────────
export function saveFlowState(state, payload, ttlSeconds = 600) {
    db.prepare('INSERT INTO hs_flow_state (state, payload, expires_at) VALUES (?, ?, ?)')
        .run(state, JSON.stringify(payload), Math.floor(Date.now() / 1000) + ttlSeconds);
}
export function consumeFlowState(state) {
    const row = db.prepare('SELECT * FROM hs_flow_state WHERE state = ?').get(state);
    db.prepare('DELETE FROM hs_flow_state WHERE state = ? OR expires_at < unixepoch()').run(state);
    if (!row || row.expires_at < Math.floor(Date.now() / 1000))
        return undefined;
    return JSON.parse(row.payload);
}
// ── audit + rate limiting ──────────────────────────────────────────────────
export function audit(userId, event, detail, durationMs) {
    db.prepare('INSERT INTO audit_log (user_id, event, detail, duration_ms) VALUES (?, ?, ?, ?)')
        .run(userId, event, detail ?? null, durationMs ?? null);
}
/** Sliding minute-window. Retourneert true als de call mag. */
export function rateLimitAllow(userId, perMinute) {
    const windowStart = Math.floor(Date.now() / 60000) * 60;
    const row = db.prepare(`
    INSERT INTO rate_buckets (user_id, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, window_start) DO UPDATE SET count = count + 1
    RETURNING count
  `).get(userId, windowStart);
    db.prepare('DELETE FROM rate_buckets WHERE window_start < ?').run(windowStart - 3600);
    return row.count <= perMinute;
}
//# sourceMappingURL=store.js.map