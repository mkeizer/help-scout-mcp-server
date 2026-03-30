import { ToolHandler } from '../tools/index.js';
import { helpScoutClient } from '../utils/helpscout-client.js';
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

describe('Report Tools', () => {
  let toolHandler: ToolHandler;
  let getSpy: jest.SpyInstance;

  beforeEach(() => {
    toolHandler = new ToolHandler();
    getSpy = jest.spyOn(helpScoutClient, 'get');
  });

  afterEach(() => {
    getSpy.mockRestore();
  });

  const baseArgs = {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z',
  };

  function makeRequest(name: string, args: Record<string, unknown> = {}): CallToolRequest {
    return {
      method: 'tools/call',
      params: { name, arguments: { ...baseArgs, ...args } },
    };
  }

  async function callAndParse(request: CallToolRequest) {
    const result = await toolHandler.callTool(request);
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: 'text'; text: string };
    return JSON.parse(textContent.text);
  }

  describe('getCompanyReport', () => {
    it('should fetch company report', async () => {
      const mockData = { current: { totalConversations: 150, customersHelped: 120 } };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getCompanyReport'));
      expect(response.current.totalConversations).toBe(150);
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/company',
        expect.objectContaining({ start: baseArgs.start, end: baseArgs.end }),
        { ttl: 900 }
      );
    });
  });

  describe('getCompanyCustomersHelped', () => {
    it('should fetch customers helped with viewBy', async () => {
      const mockData = { current: [{ date: '2024-01-01', count: 10 }] };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getCompanyCustomersHelped', { viewBy: 'day' }));
      expect(response.current).toHaveLength(1);
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/company/customers-helped',
        expect.objectContaining({ viewBy: 'day' }),
        { ttl: 900 }
      );
    });
  });

  describe('getCompanyDrilldown', () => {
    it('should fetch company drilldown with pagination', async () => {
      const mockData = { conversations: [{ id: 1, subject: 'Test' }], pages: 3 };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getCompanyDrilldown', { page: 1, rows: 25 }));
      expect(response.conversations).toHaveLength(1);
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/company/drilldown',
        expect.objectContaining({ page: 1, rows: 25 }),
        { ttl: 900 }
      );
    });
  });

  describe('getConversationsReport', () => {
    it('should fetch conversations report', async () => {
      const mockData = { current: { volume: 200, busiestDay: 'Monday' } };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getConversationsReport'));
      expect(response.current.volume).toBe(200);
      expect(getSpy).toHaveBeenCalledWith('/reports/conversations', expect.any(Object), { ttl: 900 });
    });
  });

  describe('getProductivityReport', () => {
    it('should fetch productivity report with officeHours', async () => {
      const mockData = { current: { firstResponseTime: 3600, resolutionTime: 7200 } };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getProductivityReport', { officeHours: true }));
      expect(response.current.firstResponseTime).toBe(3600);
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/productivity',
        expect.objectContaining({ officeHours: true }),
        { ttl: 900 }
      );
    });
  });

  describe('getEmailReport', () => {
    it('should fetch email report', async () => {
      const mockData = { current: { volume: 180, responseTime: 1800 } };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getEmailReport'));
      expect(response.current.volume).toBe(180);
      expect(getSpy).toHaveBeenCalledWith('/reports/email', expect.any(Object), { ttl: 900 });
    });

    it('should not include types param', async () => {
      getSpy.mockResolvedValueOnce({});

      await callAndParse(makeRequest('getEmailReport', { types: 'email' }));
      // types should be stripped by the EmailReport schema (.omit({ types: true }))
      const callArgs = getSpy.mock.calls[0][1];
      expect(callArgs.types).toBeUndefined();
    });
  });

  describe('getFirstResponseTimeReport', () => {
    it('should fetch FRT report with viewBy', async () => {
      const mockData = { current: [{ date: '2024-01-01', time: 1200 }] };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getFirstResponseTimeReport', { viewBy: 'week' }));
      expect(response.current).toHaveLength(1);
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/productivity/first-response-time',
        expect.objectContaining({ viewBy: 'week' }),
        { ttl: 900 }
      );
    });
  });

  describe('getResolutionTimeReport', () => {
    it('should fetch resolution time report', async () => {
      const mockData = { current: [{ date: '2024-01-01', time: 5400 }] };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getResolutionTimeReport', { viewBy: 'month' }));
      expect(response.current).toHaveLength(1);
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/productivity/resolution-time',
        expect.objectContaining({ viewBy: 'month' }),
        { ttl: 900 }
      );
    });
  });

  describe('getHappinessReport', () => {
    it('should fetch happiness report', async () => {
      const mockData = { current: { great: 70, ok: 20, notGood: 10 } };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getHappinessReport'));
      expect(response.current.great).toBe(70);
      expect(getSpy).toHaveBeenCalledWith('/reports/happiness', expect.any(Object), { ttl: 900 });
    });
  });

  describe('getHappinessRatings', () => {
    it('should fetch happiness ratings with filters', async () => {
      const mockData = { results: [{ id: 1, rating: 'great', comment: 'Excellent!' }] };
      getSpy.mockResolvedValueOnce(mockData);

      const response = await callAndParse(makeRequest('getHappinessRatings', { rating: 'great', page: 1 }));
      expect(response.results).toHaveLength(1);
      expect(response.results[0].rating).toBe('great');
      expect(getSpy).toHaveBeenCalledWith(
        '/reports/happiness/ratings',
        expect.objectContaining({ rating: 'great', page: 1 }),
        { ttl: 900 }
      );
    });
  });

  describe('validation', () => {
    it('should reject missing required start date', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: { name: 'getCompanyReport', arguments: { end: '2024-01-31T23:59:59Z' } },
      };
      const result = await toolHandler.callTool(request);
      const textContent = result.content[0] as { type: 'text'; text: string };
      const response = JSON.parse(textContent.text);
      expect(response.error).toBeDefined();
    });

    it('should reject missing required end date', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: { name: 'getHappinessReport', arguments: { start: '2024-01-01T00:00:00Z' } },
      };
      const result = await toolHandler.callTool(request);
      const textContent = result.content[0] as { type: 'text'; text: string };
      const response = JSON.parse(textContent.text);
      expect(response.error).toBeDefined();
    });
  });

  describe('listTools includes report tools', () => {
    it('should include all 10 report tools', async () => {
      const tools = await toolHandler.listTools();
      const reportToolNames = [
        'getCompanyReport',
        'getCompanyCustomersHelped',
        'getCompanyDrilldown',
        'getConversationsReport',
        'getProductivityReport',
        'getEmailReport',
        'getFirstResponseTimeReport',
        'getResolutionTimeReport',
        'getHappinessReport',
        'getHappinessRatings',
      ];
      const toolNames = tools.map(t => t.name);
      for (const name of reportToolNames) {
        expect(toolNames).toContain(name);
      }
      // Total: 14 existing + 10 report = 24
      expect(tools).toHaveLength(24);
    });
  });

  describe('base params', () => {
    it('should pass optional comparison period params', async () => {
      getSpy.mockResolvedValueOnce({});

      await callAndParse(makeRequest('getCompanyReport', {
        previousStart: '2023-12-01T00:00:00Z',
        previousEnd: '2023-12-31T23:59:59Z',
        mailboxes: '111589,205740',
        tags: '1,2',
      }));

      expect(getSpy).toHaveBeenCalledWith(
        '/reports/company',
        expect.objectContaining({
          previousStart: '2023-12-01T00:00:00Z',
          previousEnd: '2023-12-31T23:59:59Z',
          mailboxes: '111589,205740',
          tags: '1,2',
        }),
        { ttl: 900 }
      );
    });
  });
});
