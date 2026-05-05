#!/usr/bin/env node
export declare class HelpScoutMCPServer {
    private server;
    private discoveredInboxes;
    /**
     * Private constructor - use static `create()` factory method instead.
     * This enables async inbox discovery before server instantiation.
     */
    private constructor();
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
    private setupHandlers;
    start(): Promise<void>;
    /**
     * Start in HTTP mode behind a reverse proxy. Uses the MCP SDK's
     * StreamableHTTPServerTransport in stateless mode (no session-id
     * tracking — each request is independent, simpler for a long-running
     * service that doesn't need stickiness).
     *
     * Endpoint: POST /mcp (and GET for SSE polling, per the spec).
     * Auth: Authorization: Bearer <token> against HSMCP_BEARER_TOKENS.
     * Anything else returns 404. /healthz returns 200 OK without auth so
     * upstream proxies (Traefik, load-balancers) can probe liveness.
     */
    private startHttp;
    stop(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map