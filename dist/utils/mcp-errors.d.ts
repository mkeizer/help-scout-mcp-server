import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ApiError } from '../schema/types.js';
export interface FormatViolation {
    /** Stable rule identifier, e.g. `em_dash`, `forbidden_phrase`. */
    rule: string;
    /** The exact offending text as matched. */
    value: string;
    /** Client-agnostic repair hint. */
    hint: string;
}
/**
 * Thrown by the outbound customer-mail format gate (createReply,
 * createConversation, updateReplyDraft). Carries machine-readable violations
 * so any MCP client can auto-repair and retry without regexing prose.
 * Improve hsmcp #95.
 */
export declare class FormatPolicyError extends Error {
    readonly tool: string;
    readonly violations: FormatViolation[];
    readonly code: "FORMAT_POLICY_BLOCKED";
    constructor(tool: string, violations: FormatViolation[]);
}
/**
 * Creates a standardized MCP error response for tool calls
 */
export declare function createMcpToolError(error: unknown, context: {
    toolName: string;
    requestId: string;
    duration?: number;
}): CallToolResult;
/**
 * Creates a standardized MCP error response for resource handlers
 */
export declare function createMcpResourceError(error: unknown, context: {
    resourceUri: string;
    requestId?: string;
}): {
    type: 'text';
    text: string;
};
/**
 * Type guard to check if an error is our structured ApiError.
 * Validates code against known enum values to avoid matching Node.js system errors.
 */
export declare function isApiError(error: unknown): error is ApiError;
/**
 * Extracts actionable suggestions from API errors for LLM agents
 */
export declare function getErrorSuggestion(error: ApiError): string;
//# sourceMappingURL=mcp-errors.d.ts.map