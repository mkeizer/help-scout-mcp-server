import type { IncomingMessage, ServerResponse } from 'node:http';
export declare function protectedResourceMetadata(): Record<string, unknown>;
export declare function authorizationServerMetadata(): Record<string, unknown>;
/**
 * Behandelt alle SaaS-OAuth-paden. Retourneert true als het pad van ons was.
 */
export declare function handleOauthRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
export interface OauthPrincipal {
    userId: number;
    scope: string;
}
/**
 * Valideer een OAuth-access-token. Retourneert principal of null.
 * (De 401-respons met resource_metadata doet de caller — die weet of er ook
 * nog een legacy-bearer-lijst is om te proberen.)
 */
export declare function authenticateOauthToken(token: string): OauthPrincipal | null;
export declare function send401WithResourceMetadata(res: ServerResponse): void;
//# sourceMappingURL=oauth.d.ts.map