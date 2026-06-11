// crypto.ts — encryptie en token-helpers voor de SaaS-laag.
//
// HS-tokens liggen versleuteld op disk (AES-256-GCM); de master-key staat
// BUITEN de docroot (saasDir) en wordt bij eerste start gegenereerd. Eigen
// MCP-tokens worden nooit opgeslagen, alleen hun sha256-hash.

import { randomBytes, createCipheriv, createDecipheriv, createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

let masterKey: Buffer | null = null;

export function initCrypto(saasDir: string): void {
  mkdirSync(saasDir, { recursive: true, mode: 0o700 });
  const keyPath = join(saasDir, 'master.key');
  if (!existsSync(keyPath)) {
    writeFileSync(keyPath, randomBytes(32));
    chmodSync(keyPath, 0o600);
  }
  masterKey = readFileSync(keyPath);
  if (masterKey.length !== 32) {
    throw new Error(`master.key must be exactly 32 bytes (got ${masterKey.length})`);
  }
}

function requireKey(): Buffer {
  if (!masterKey) throw new Error('crypto not initialized — call initCrypto() first');
  return masterKey;
}

/** AES-256-GCM: iv(12) || tag(16) || ciphertext, base64. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', requireKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64');
}

export function decrypt(blob: string): string {
  const raw = Buffer.from(blob, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', requireKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

export function sha256hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

/** Opaque token met herkenbaar prefix, bijv. hsmcp_at_<48 hex>. */
export function newToken(prefix: string): string {
  return `${prefix}_${randomBytes(24).toString('hex')}`;
}

/** PKCE S256: base64url(sha256(verifier)). */
export function pkceS256(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}
