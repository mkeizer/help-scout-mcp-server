import { Tool, CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * Decide whether an attachment buffer should be returned as text or base64.
 * Magic-byte sniff for common binary formats (PDFs and images start with
 * ASCII-looking headers but contain high-bit bytes downstream that UTF-8
 * decode would mangle), then a printable-ASCII ratio over the first 2KB as
 * fallback. .eml and plain-text logs are ASCII-heavy; binary formats are not.
 */
export declare function resolveAttachmentFormat(buf: Buffer, requested: 'auto' | 'text' | 'base64'): 'text' | 'base64';
export declare class ToolHandler {
    private callHistory;
    private currentUserQuery?;
    constructor();
    /**
     * Escape special characters in Help Scout query syntax to prevent injection
     * Help Scout uses double quotes for exact phrases, so we need to escape them
     */
    private escapeQueryTerm;
    /**
     * Append a createdAt date range to an existing Help Scout query string.
     * Help Scout has no native createdAfter/createdBefore URL params, so we
     * use query syntax: (createdAt:[start TO end]).
     */
    private appendCreatedAtFilter;
    /**
     * Set the current user query for context-aware validation
     */
    setUserContext(userQuery: string): void;
    listTools(): Promise<Tool[]>;
    callTool(request: CallToolRequest): Promise<CallToolResult>;
    private searchInboxes;
    private searchConversations;
    private getConversationSummary;
    private getThreads;
    private getAttachment;
    private getOriginalSource;
    private getServerTime;
    private listAllInboxes;
    private advancedConversationSearch;
    /**
     * Performs comprehensive conversation search across multiple statuses
     * @param args - Search parameters including search terms, statuses, and timeframe
     * @returns Promise<CallToolResult> with search results organized by status
     * @example
     * comprehensiveConversationSearch({
     *   searchTerms: ["urgent", "billing"],
     *   timeframeDays: 30,
     *   inboxId: "123456"
     * })
     */
    private comprehensiveConversationSearch;
    /**
     * Build search context from input parameters
     */
    private buildComprehensiveSearchContext;
    /**
     * Calculate time range for search
     * Note: Help Scout API requires ISO 8601 format WITHOUT milliseconds
     */
    private calculateTimeRange;
    /**
     * Build Help Scout search query from terms and search locations (with injection protection)
     */
    private buildSearchQuery;
    /**
     * Execute search across multiple statuses with error handling
     */
    private executeMultiStatusSearch;
    /**
     * Apply client-side createdBefore filter (Help Scout API does not support this natively).
     * Returns filtered conversations and metadata about what was removed.
     */
    private applyCreatedBeforeFilter;
    /**
     * Build inbox scope description string for response metadata.
     */
    private formatInboxScope;
    /**
     * Build pagination info that distinguishes filtered count from API total.
     * Used when createdBefore client-side filtering modifies a single API response.
     */
    private buildFilteredPagination;
    /**
     * Search conversations for a single status
     */
    private searchSingleStatus;
    /**
     * Format comprehensive search results into summary response
     */
    private formatComprehensiveSearchResults;
    private structuredConversationFilter;
    private createConversation;
    private createReply;
    private createNote;
    private updateConversationStatus;
    private updateConversationTags;
    private redactAddress;
    private redactCustomer;
    private getCustomer;
    private listCustomers;
    private searchCustomersByEmail;
    private getCustomerContacts;
    private redactOrganization;
    private getOrganization;
    private listOrganizations;
    private getOrganizationMembers;
    private getOrganizationConversations;
}
export declare const toolHandler: ToolHandler;
//# sourceMappingURL=index.d.ts.map