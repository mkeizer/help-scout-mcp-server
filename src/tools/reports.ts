import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { helpScoutClient } from '../utils/helpscout-client.js';
import { logger } from '../utils/logger.js';
import {
  ReportBaseInput,
  GetCompanyReportInputSchema,
  GetCompanyCustomersHelpedInputSchema,
  GetCompanyDrilldownInputSchema,
  GetConversationsReportInputSchema,
  GetProductivityReportInputSchema,
  GetEmailReportInputSchema,
  GetFirstResponseTimeReportInputSchema,
  GetResolutionTimeReportInputSchema,
  GetHappinessReportInputSchema,
  GetHappinessRatingsInputSchema,
} from '../schema/types.js';

/** Cache TTL for report data (15 minutes) */
const REPORT_CACHE_TTL = 900;

export class ReportToolHandler {
  /**
   * Build query params from the shared base report fields.
   */
  private buildReportParams(input: ReportBaseInput): Record<string, unknown> {
    const params: Record<string, unknown> = {
      start: input.start,
      end: input.end,
    };
    if (input.previousStart) params.previousStart = input.previousStart;
    if (input.previousEnd) params.previousEnd = input.previousEnd;
    if (input.mailboxes) params.mailboxes = input.mailboxes;
    if (input.tags) params.tags = input.tags;
    if (input.types) params.types = input.types;
    if (input.folders) params.folders = input.folders;
    return params;
  }

  private toResult(data: unknown): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }

  async getCompanyReport(args: unknown): Promise<CallToolResult> {
    const input = GetCompanyReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    logger.debug('Fetching company report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/company', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getCompanyCustomersHelped(args: unknown): Promise<CallToolResult> {
    const input = GetCompanyCustomersHelpedInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.viewBy) params.viewBy = input.viewBy;
    logger.debug('Fetching customers helped report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/company/customers-helped', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getCompanyDrilldown(args: unknown): Promise<CallToolResult> {
    const input = GetCompanyDrilldownInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.page) params.page = input.page;
    if (input.rows) params.rows = input.rows;
    if (input.range) params.range = input.range;
    if (input.rangeId !== undefined) params.rangeId = input.rangeId;
    logger.debug('Fetching company drilldown', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/company/drilldown', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getConversationsReport(args: unknown): Promise<CallToolResult> {
    const input = GetConversationsReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    logger.debug('Fetching conversations report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/conversations', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getProductivityReport(args: unknown): Promise<CallToolResult> {
    const input = GetProductivityReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.officeHours !== undefined) params.officeHours = input.officeHours;
    logger.debug('Fetching productivity report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/productivity', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getEmailReport(args: unknown): Promise<CallToolResult> {
    const input = GetEmailReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.officeHours !== undefined) params.officeHours = input.officeHours;
    logger.debug('Fetching email report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/email', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getFirstResponseTimeReport(args: unknown): Promise<CallToolResult> {
    const input = GetFirstResponseTimeReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.officeHours !== undefined) params.officeHours = input.officeHours;
    if (input.viewBy) params.viewBy = input.viewBy;
    logger.debug('Fetching first response time report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/productivity/first-response-time', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getResolutionTimeReport(args: unknown): Promise<CallToolResult> {
    const input = GetResolutionTimeReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.officeHours !== undefined) params.officeHours = input.officeHours;
    if (input.viewBy) params.viewBy = input.viewBy;
    logger.debug('Fetching resolution time report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/productivity/resolution-time', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getHappinessReport(args: unknown): Promise<CallToolResult> {
    const input = GetHappinessReportInputSchema.parse(args);
    const params = this.buildReportParams(input);
    logger.debug('Fetching happiness report', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/happiness', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }

  async getHappinessRatings(args: unknown): Promise<CallToolResult> {
    const input = GetHappinessRatingsInputSchema.parse(args);
    const params = this.buildReportParams(input);
    if (input.page) params.page = input.page;
    if (input.sortField) params.sortField = input.sortField;
    if (input.sortOrder) params.sortOrder = input.sortOrder;
    if (input.rating) params.rating = input.rating;
    logger.debug('Fetching happiness ratings', { start: input.start, end: input.end });
    const data = await helpScoutClient.get('/reports/happiness/ratings', params, { ttl: REPORT_CACHE_TTL });
    return this.toResult(data);
  }
}

export const reportToolHandler = new ReportToolHandler();
