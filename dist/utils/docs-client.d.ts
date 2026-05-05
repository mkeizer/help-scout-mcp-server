/**
 * Help Scout Docs API client.
 * Uses HTTP Basic Auth with API key (separate from the Mailbox API OAuth2 flow).
 * API docs: https://developer.helpscout.com/docs-api/
 */
export declare class DocsClient {
    private client;
    constructor();
    isConfigured(): boolean;
    get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(endpoint: string, data: Record<string, unknown>): Promise<T>;
    put<T>(endpoint: string, data: Record<string, unknown>): Promise<T>;
    delete(endpoint: string): Promise<void>;
}
export declare const docsClient: DocsClient;
//# sourceMappingURL=docs-client.d.ts.map