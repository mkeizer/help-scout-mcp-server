#!/usr/bin/env node
export declare class HelpScoutMCPServer {
    private server;
    private discoveredInboxes;
    /**
     * Private constructor - use static `create()` factory method instead.
     * This enables async inbox discovery before server instantiation.
     */
    private cachedInstructions;
    private constructor();
    /**
     * Builds a fresh Server instance with all request handlers wired up.
     * Used both at startup (for stdio mode) and per-request in HTTP mode —
     * SDK forbids reusing one Server across multiple transports, so HTTP mode
     * spins up a new Server (cheap: just hash-map handler registration) per
     * incoming request alongside its own StreamableHTTPServerTransport.
     */
    private buildServer;
    /**
     * Async factory method for creating the MCP server.
     * Discovers available inboxes and builds dynamic instructions before server creation.
     */
    static create(): Promise<HelpScoutMCPServer>;
    /**
     * Discovers available inboxes and builds server instructions.
     * Called once during server creation to populate instructions sent to MCP clients.
     */
    private static discoverAndBuildInstructions;
    private setupHandlersOn;
    start(): Promise<void>;
    /**
     * Start in HTTP mode behind a reverse proxy. Stateless StreamableHTTP:
     * SDK requires a FRESH transport per request — reusing a stateless
     * transport throws "Stateless transport cannot be reused across requests"
     * (see WebStandardStreamableHTTPServerTransport.handleRequest line 137).
     * So we create + connect + close one transport per incoming request.
     *
     * Endpoint: POST /mcp (and GET for SSE polling, per the spec).
     * Auth: Authorization: Bearer <token> against HSMCP_BEARER_TOKENS.
     * /healthz returns 200 OK without auth so upstream proxies (Traefik,
     * load-balancers) can probe liveness without consuming a token.
     * Anything else returns 404.
     */
    private startHttp;
    stop(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map