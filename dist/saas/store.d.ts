export interface SaasUser {
    id: number;
    hs_user_id: number;
    hs_email: string;
    hs_company_id: number | null;
    disabled: 0 | 1;
}
export interface HsTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}
export interface McpClient {
    client_id: string;
    client_name: string;
    redirect_uris: string[];
}
export interface Grant {
    id: number;
    kind: 'code' | 'refresh' | 'access';
    token_hash: string;
    client_id: string;
    user_id: number;
    scope: string;
    pkce_challenge: string | null;
    redirect_uri: string | null;
    expires_at: number;
    revoked: 0 | 1;
}
export declare function initStore(saasDir: string): void;
export declare function upsertUser(hsUserId: number, email: string, companyId: number | null): SaasUser;
export declare function getUser(userId: number): SaasUser | undefined;
export declare function saveHsTokens(userId: number, t: HsTokens): void;
export declare function getHsTokens(userId: number): HsTokens | null;
export declare function deleteUserAuth(userId: number): void;
export declare function saveClient(c: McpClient): void;
export declare function getClient(clientId: string): McpClient | undefined;
export declare function saveGrant(g: Omit<Grant, 'id' | 'revoked' | 'token_hash'> & {
    token: string;
}): void;
export declare function consumeGrant(kind: Grant['kind'], token: string): Grant | undefined;
export declare function lookupGrant(kind: Grant['kind'], token: string): Grant | undefined;
export declare function revokeToken(token: string): void;
export declare function saveFlowState(state: string, payload: Record<string, unknown>, ttlSeconds?: number): void;
export declare function consumeFlowState(state: string): Record<string, unknown> | undefined;
export declare function audit(userId: number | null, event: string, detail?: string, durationMs?: number): void;
/** Sliding minute-window. Retourneert true als de call mag. */
export declare function rateLimitAllow(userId: number, perMinute: number): boolean;
//# sourceMappingURL=store.d.ts.map