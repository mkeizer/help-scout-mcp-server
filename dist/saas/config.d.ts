export interface SaasConfig {
    enabled: boolean;
    /** Publieke basis-URL, bijv. https://hsmcp.keurigonline.nl */
    publicBaseUrl: string;
    saasDir: string;
    hsAppId: string;
    hsAppSecret: string;
    allowlist: {
        companies: number[];
        emails: string[];
    };
    /** Tool-calls per gebruiker per minuut. */
    rateLimitPerMinute: number;
    /** Write-tools toestaan voor OAuth-gebruikers met write-scope. v1: false. */
    allowWriteScope: boolean;
}
export declare const saasConfig: SaasConfig;
export declare function validateSaasConfig(): void;
//# sourceMappingURL=config.d.ts.map