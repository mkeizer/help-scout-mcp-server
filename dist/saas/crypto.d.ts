export declare function initCrypto(saasDir: string): void;
/** AES-256-GCM: iv(12) || tag(16) || ciphertext, base64. */
export declare function encrypt(plaintext: string): string;
export declare function decrypt(blob: string): string;
export declare function sha256hex(value: string): string;
export declare function constantTimeEqualHex(a: string, b: string): boolean;
/** Opaque token met herkenbaar prefix, bijv. hsmcp_at_<48 hex>. */
export declare function newToken(prefix: string): string;
/** PKCE S256: base64url(sha256(verifier)). */
export declare function pkceS256(verifier: string): string;
//# sourceMappingURL=crypto.d.ts.map