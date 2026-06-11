import { type SaasUser, type HsTokens } from './store.js';
export declare function buildHsAuthorizeUrl(state: string): string;
export declare function exchangeHsCode(code: string): Promise<HsTokens>;
export declare function refreshHsTokens(userId: number, refreshToken: string): Promise<HsTokens>;
export interface HsIdentity {
    hsUserId: number;
    email: string;
    companyId: number | null;
    firstName?: string;
}
/** Wie is dit? GET /v2/users/me met het verse access-token. */
export declare function fetchHsIdentity(accessToken: string): Promise<HsIdentity>;
/**
 * Rond Flow B af: code → tokens → identiteit → allowlist-check → user-record.
 * Gooit een Error met user-leesbare message bij een geweigerde koppeling.
 */
export declare function completeHsLink(code: string): Promise<SaasUser>;
/**
 * Geldig HS-access-token voor een user, met lazy refresh.
 * Retourneert null als de koppeling weg/ingetrokken is.
 */
export declare function validHsAccessToken(userId: number): Promise<string | null>;
//# sourceMappingURL=hs-oauth.d.ts.map