import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class ReportToolHandler {
    /**
     * Build query params from the shared base report fields.
     */
    private buildReportParams;
    private toResult;
    getCompanyReport(args: unknown): Promise<CallToolResult>;
    getCompanyCustomersHelped(args: unknown): Promise<CallToolResult>;
    getCompanyDrilldown(args: unknown): Promise<CallToolResult>;
    getConversationsReport(args: unknown): Promise<CallToolResult>;
    getProductivityReport(args: unknown): Promise<CallToolResult>;
    getEmailReport(args: unknown): Promise<CallToolResult>;
    getFirstResponseTimeReport(args: unknown): Promise<CallToolResult>;
    getResolutionTimeReport(args: unknown): Promise<CallToolResult>;
    getHappinessReport(args: unknown): Promise<CallToolResult>;
    getHappinessRatings(args: unknown): Promise<CallToolResult>;
}
export declare const reportToolHandler: ReportToolHandler;
//# sourceMappingURL=reports.d.ts.map