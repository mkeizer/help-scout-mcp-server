import { AxiosError } from 'axios';
interface RequestMetadata {
    requestId: string;
    startTime: number;
}
interface RetryConfig {
    retries: number;
    retryDelay: number;
    maxRetryDelay: number;
    retryCondition?: (error: AxiosError) => boolean;
}
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: RequestMetadata;
        retryConfig?: RetryConfig;
    }
}
/**
 * Connection pool configuration for HTTP agents
 */
interface ConnectionPoolConfig {
    maxSockets: number;
    maxFreeSockets: number;
    timeout: number;
    keepAlive: boolean;
    keepAliveMsecs: number;
}
export interface PaginatedResponse<T> {
    _embedded: {
        [key: string]: T[];
    };
    _links?: {
        next?: {
            href: string;
        };
        prev?: {
            href: string;
        };
    };
    page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}
export declare class HelpScoutClient {
    private client;
    private accessToken;
    private tokenExpiresAt;
    private authenticationPromise;
    private httpAgent;
    private httpsAgent;
    private defaultRetryConfig;
    constructor(poolConfig?: Partial<ConnectionPoolConfig>);
    private sleep;
    private calculateRetryDelay;
    private executeWithRetry;
    private setupInterceptors;
    private ensureAuthenticated;
    private authenticate;
    private transformError;
    get<T>(endpoint: string, params?: Record<string, unknown>, cacheOptions?: {
        ttl?: number;
    }): Promise<T>;
    private getDefaultCacheTtl;
    post<T>(endpoint: string, data: Record<string, unknown>): Promise<T>;
    postWithLocation<T>(endpoint: string, data: Record<string, unknown>): Promise<{
        data: T;
        locationId: string | null;
    }>;
    put<T>(endpoint: string, data: Record<string, unknown>): Promise<T>;
    patch<T>(endpoint: string, data: Record<string, unknown>): Promise<T>;
    testConnection(): Promise<boolean>;
    /**
     * Get connection pool statistics for monitoring
     */
    getPoolStats(): {
        http: {
            sockets: number;
            freeSockets: number;
            pending: number;
        };
        https: {
            sockets: number;
            freeSockets: number;
            pending: number;
        };
    };
    /**
     * Gracefully close all connections in the pool
     */
    closePool(): Promise<void>;
    /**
     * Clear idle connections to free up resources
     */
    clearIdleConnections(): void;
    /**
     * Log current connection pool status for monitoring
     */
    logPoolStatus(): void;
}
export declare const helpScoutClient: HelpScoutClient;
export {};
//# sourceMappingURL=helpscout-client.d.ts.map