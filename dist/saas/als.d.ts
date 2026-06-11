import { AsyncLocalStorage } from 'node:async_hooks';
import type { HelpScoutClient } from '../utils/helpscout-client.js';
export interface RequestContext {
    client: HelpScoutClient;
    userId: number;
    scope: string;
}
export declare const requestContext: AsyncLocalStorage<RequestContext>;
//# sourceMappingURL=als.d.ts.map