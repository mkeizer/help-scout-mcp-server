// hs-oauth.ts — Flow B: onze server ↔ Help Scout (authorization-code flow).
//
// Anders dan de client_credentials-flow van de single-tenant server krijgen we
// hier per GEBRUIKER een access- (48u) + refresh-token. Refresh roteert: Help
// Scout geeft bij elke refresh een nieuw refresh-token terug; het oude is dan
// ongeldig — vandaar dat saveHsTokens altijd beide overschrijft.
import axios from 'axios';
import { saasConfig } from './config.js';
import { saveHsTokens, getHsTokens, upsertUser } from './store.js';
import { logger } from '../utils/logger.js';
const HS_AUTHORIZE_URL = 'https://secure.helpscout.net/authentication/authorizeClientApplication';
const HS_TOKEN_URL = 'https://api.helpscout.net/v2/oauth2/token';
export function buildHsAuthorizeUrl(state) {
    const u = new URL(HS_AUTHORIZE_URL);
    u.searchParams.set('client_id', saasConfig.hsAppId);
    u.searchParams.set('state', state);
    return u.toString();
}
function toTokens(data) {
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        // 5 min veiligheidsmarge op de 48u-expiry
        expiresAt: Math.floor(Date.now() / 1000) + data.expires_in - 300,
    };
}
export async function exchangeHsCode(code) {
    const resp = await axios.post(HS_TOKEN_URL, {
        grant_type: 'authorization_code',
        code,
        client_id: saasConfig.hsAppId,
        client_secret: saasConfig.hsAppSecret,
    });
    return toTokens(resp.data);
}
export async function refreshHsTokens(userId, refreshToken) {
    const resp = await axios.post(HS_TOKEN_URL, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: saasConfig.hsAppId,
        client_secret: saasConfig.hsAppSecret,
    });
    const tokens = toTokens(resp.data);
    saveHsTokens(userId, tokens);
    return tokens;
}
/** Wie is dit? GET /v2/users/me met het verse access-token. */
export async function fetchHsIdentity(accessToken) {
    const resp = await axios.get('https://api.helpscout.net/v2/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const d = resp.data;
    return {
        hsUserId: d.id,
        email: d.email,
        companyId: d.companyId ?? d.company?.id ?? null,
        firstName: d.firstName,
    };
}
/**
 * Rond Flow B af: code → tokens → identiteit → allowlist-check → user-record.
 * Gooit een Error met user-leesbare message bij een geweigerde koppeling.
 */
export async function completeHsLink(code) {
    const tokens = await exchangeHsCode(code);
    const identity = await fetchHsIdentity(tokens.accessToken);
    if (!isAllowed(identity)) {
        logger.warn('saas: HS-koppeling geweigerd door allowlist', { email: identity.email, companyId: identity.companyId });
        throw new Error(`Account ${identity.email} is not on the access list for this server. ` +
            'Contact the administrator to request access.');
    }
    const user = upsertUser(identity.hsUserId, identity.email, identity.companyId);
    saveHsTokens(user.id, tokens);
    logger.info('saas: HS-account gekoppeld', { userId: user.id, companyId: identity.companyId });
    return user;
}
function isAllowed(identity) {
    const allow = saasConfig.allowlist;
    if (allow.companies.length === 0 && allow.emails.length === 0) {
        // Lege allowlist = dicht (fail closed). Expliciet "*" in emails = open.
        return false;
    }
    if (allow.emails.includes('*'))
        return true;
    if (identity.companyId !== null && allow.companies.includes(identity.companyId))
        return true;
    return allow.emails.some(e => e.toLowerCase() === identity.email.toLowerCase());
}
/**
 * Geldig HS-access-token voor een user, met lazy refresh.
 * Retourneert null als de koppeling weg/ingetrokken is.
 */
export async function validHsAccessToken(userId) {
    const tokens = getHsTokens(userId);
    if (!tokens)
        return null;
    if (tokens.expiresAt > Math.floor(Date.now() / 1000)) {
        return tokens.accessToken;
    }
    try {
        const fresh = await refreshHsTokens(userId, tokens.refreshToken);
        return fresh.accessToken;
    }
    catch (err) {
        logger.warn('saas: HS-token-refresh mislukt (koppeling ingetrokken?)', {
            userId,
            error: err instanceof Error ? err.message : String(err),
        });
        return null;
    }
}
//# sourceMappingURL=hs-oauth.js.map