export interface Config {
    helpscout: {
        apiKey: string;
        clientId?: string;
        clientSecret?: string;
        baseUrl: string;
        defaultInboxId?: string;
    };
    docs: {
        apiKey: string;
        collectionId: string;
    };
    cache: {
        ttlSeconds: number;
        maxSize: number;
    };
    logging: {
        level: string;
    };
    security: {
        allowPii: boolean;
    };
    connectionPool: {
        maxSockets: number;
        maxFreeSockets: number;
        timeout: number;
        keepAlive: boolean;
        keepAliveMsecs: number;
    };
}
export declare const config: Config;
export declare function validateConfig(): void;
//# sourceMappingURL=config.d.ts.map