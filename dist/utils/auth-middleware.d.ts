import type { IncomingMessage, ServerResponse } from 'node:http';
export declare function loadAcceptedTokens(): Set<string>;
export declare function authorizeRequest(req: IncomingMessage, res: ServerResponse, acceptedTokens: Set<string>): boolean;
//# sourceMappingURL=auth-middleware.d.ts.map