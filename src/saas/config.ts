// config.ts — SaaS-configuratie, los van de bestaande utils/config.ts.
//
// Actief wanneer HSMCP_SAAS_MODE=1. Secrets en state leven in saasDir
// (default: ~/hsmcp-config), bewust BUITEN elke docroot — zie het
// share-route-incident in docs/ontwerp-hsmcp-saas.md.

import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

export interface SaasConfig {
  enabled: boolean;
  /** Publieke basis-URL, bijv. https://hsmcp.keurigonline.nl */
  publicBaseUrl: string;
  saasDir: string;
  hsAppId: string;
  hsAppSecret: string;
  allowlist: { companies: number[]; emails: string[] };
  /** Tool-calls per gebruiker per minuut. */
  rateLimitPerMinute: number;
  /** Write-tools toestaan voor OAuth-gebruikers met write-scope. v1: false. */
  allowWriteScope: boolean;
}

function loadAllowlist(saasDir: string): { companies: number[]; emails: string[] } {
  const p = join(saasDir, 'allowlist.json');
  if (!existsSync(p)) return { companies: [], emails: [] };
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    return {
      companies: Array.isArray(raw.companies) ? raw.companies.map(Number) : [],
      emails: Array.isArray(raw.emails) ? raw.emails.map(String) : [],
    };
  } catch {
    // Kapotte allowlist = dicht, niet open
    return { companies: [], emails: [] };
  }
}

const saasDir = process.env.HSMCP_SAAS_DIR || join(homedir(), 'hsmcp-config');

export const saasConfig: SaasConfig = {
  enabled: process.env.HSMCP_SAAS_MODE === '1',
  publicBaseUrl: (process.env.HSMCP_PUBLIC_URL || 'https://hsmcp.keurigonline.nl').replace(/\/$/, ''),
  saasDir,
  hsAppId: process.env.HSMCP_SAAS_HS_APP_ID || '',
  hsAppSecret: process.env.HSMCP_SAAS_HS_APP_SECRET || '',
  allowlist: loadAllowlist(saasDir),
  rateLimitPerMinute: parseInt(process.env.HSMCP_SAAS_RATE_PER_MIN || '60', 10),
  allowWriteScope: process.env.HSMCP_SAAS_ALLOW_WRITE === '1',
};

export function validateSaasConfig(): void {
  if (!saasConfig.enabled) return;
  if (!saasConfig.hsAppId || !saasConfig.hsAppSecret) {
    throw new Error('HSMCP_SAAS_MODE=1 vereist HSMCP_SAAS_HS_APP_ID en HSMCP_SAAS_HS_APP_SECRET');
  }
  if (!saasConfig.publicBaseUrl.startsWith('https://')) {
    throw new Error('HSMCP_PUBLIC_URL moet https zijn (OAuth-redirects)');
  }
}
