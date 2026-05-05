import { helpScoutClient } from '../utils/helpscout-client.js';
import { logger } from '../utils/logger.js';
import { GetCompanyReportInputSchema, GetCompanyCustomersHelpedInputSchema, GetCompanyDrilldownInputSchema, GetConversationsReportInputSchema, GetProductivityReportInputSchema, GetEmailReportInputSchema, GetFirstResponseTimeReportInputSchema, GetResolutionTimeReportInputSchema, GetHappinessReportInputSchema, GetHappinessRatingsInputSchema, } from '../schema/types.js';
/** Cache TTL for report data (15 minutes) */
const REPORT_CACHE_TTL = 900;
export class ReportToolHandler {
    /**
     * Build query params from the shared base report fields.
     */
    buildReportParams(input) {
        const params = {
            start: input.start,
            end: input.end,
        };
        if (input.previousStart)
            params.previousStart = input.previousStart;
        if (input.previousEnd)
            params.previousEnd = input.previousEnd;
        if (input.mailboxes)
            params.mailboxes = input.mailboxes;
        if (input.tags)
            params.tags = input.tags;
        if (input.types)
            params.types = input.types;
        if (input.folders)
            params.folders = input.folders;
        return params;
    }
    toResult(data) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(data, null, 2),
                }],
        };
    }
    async getCompanyReport(args) {
        const input = GetCompanyReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        logger.debug('Fetching company report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/company', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getCompanyCustomersHelped(args) {
        const input = GetCompanyCustomersHelpedInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.viewBy)
            params.viewBy = input.viewBy;
        logger.debug('Fetching customers helped report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/company/customers-helped', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getCompanyDrilldown(args) {
        const input = GetCompanyDrilldownInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.page)
            params.page = input.page;
        if (input.rows)
            params.rows = input.rows;
        if (input.range)
            params.range = input.range;
        if (input.rangeId !== undefined)
            params.rangeId = input.rangeId;
        logger.debug('Fetching company drilldown', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/company/drilldown', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getConversationsReport(args) {
        const input = GetConversationsReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        logger.debug('Fetching conversations report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/conversations', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getProductivityReport(args) {
        const input = GetProductivityReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.officeHours !== undefined)
            params.officeHours = input.officeHours;
        logger.debug('Fetching productivity report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/productivity', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getEmailReport(args) {
        const input = GetEmailReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.officeHours !== undefined)
            params.officeHours = input.officeHours;
        logger.debug('Fetching email report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/email', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getFirstResponseTimeReport(args) {
        const input = GetFirstResponseTimeReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.officeHours !== undefined)
            params.officeHours = input.officeHours;
        if (input.viewBy)
            params.viewBy = input.viewBy;
        logger.debug('Fetching first response time report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/productivity/first-response-time', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getResolutionTimeReport(args) {
        const input = GetResolutionTimeReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.officeHours !== undefined)
            params.officeHours = input.officeHours;
        if (input.viewBy)
            params.viewBy = input.viewBy;
        logger.debug('Fetching resolution time report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/productivity/resolution-time', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getHappinessReport(args) {
        const input = GetHappinessReportInputSchema.parse(args);
        const params = this.buildReportParams(input);
        logger.debug('Fetching happiness report', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/happiness', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
    async getHappinessRatings(args) {
        const input = GetHappinessRatingsInputSchema.parse(args);
        const params = this.buildReportParams(input);
        if (input.page)
            params.page = input.page;
        if (input.sortField)
            params.sortField = input.sortField;
        if (input.sortOrder)
            params.sortOrder = input.sortOrder;
        if (input.rating)
            params.rating = input.rating;
        logger.debug('Fetching happiness ratings', { start: input.start, end: input.end });
        const data = await helpScoutClient.get('/reports/happiness/ratings', params, { ttl: REPORT_CACHE_TTL });
        return this.toResult(data);
    }
}
export const reportToolHandler = new ReportToolHandler();
//# sourceMappingURL=reports.js.map