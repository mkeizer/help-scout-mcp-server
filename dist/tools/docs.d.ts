import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class DocsToolHandler {
    private toResult;
    private getCollectionId;
    /**
     * Returns the list of Docs tools. Returns empty array if Docs API key is not configured.
     */
    listTools(): Tool[];
    listDocsCategories(args: unknown): Promise<CallToolResult>;
    listDocsArticles(args: unknown): Promise<CallToolResult>;
    searchDocsArticles(args: unknown): Promise<CallToolResult>;
    getDocsArticle(args: unknown): Promise<CallToolResult>;
    createDocsArticle(args: unknown): Promise<CallToolResult>;
    updateDocsArticle(args: unknown): Promise<CallToolResult>;
    deleteDocsArticle(args: unknown): Promise<CallToolResult>;
}
export declare const docsToolHandler: DocsToolHandler;
//# sourceMappingURL=docs.d.ts.map