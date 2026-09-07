import nock from 'nock';
import { ToolHandler, htmlToPlainText } from '../tools/index.js';
import { FormatPolicyError, createMcpToolError } from '../utils/mcp-errors.js';
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { config } from '../utils/config.js';

const host = 'https://api.helpscout.net';
const baseURL = `${host}/v2`;

function call(handler: ToolHandler, name: string, args: Record<string, unknown>) {
  return handler.callTool({ method: 'tools/call', params: { name, arguments: args } } as CallToolRequest);
}

function thread(id: number, createdAt: string, extra: Partial<Record<string, unknown>> = {}) {
  return {
    id, type: 'customer', status: 'active', state: 'published', action: null,
    body: `<div>Hallo,<br><br>bericht ${id}</div><blockquote>oud</blockquote>`,
    source: { type: 'email', via: 'customer' }, createdBy: { id: 1, type: 'customer', email: 'k@example.com' },
    createdAt, _links: { self: { href: 'x' } }, ...extra,
  };
}

describe('improve hsmcp sep 2026', () => {
  let handler: ToolHandler;
  beforeEach(() => {
    process.env.HELPSCOUT_CLIENT_ID = 'test-client-id';
    process.env.HELPSCOUT_CLIENT_SECRET = 'test-client-secret';
    process.env.HELPSCOUT_BASE_URL = `${baseURL}/`;
    // config is evaluated at import time; set the credentials on the object itself
    config.helpscout.clientId = 'test-client-id';
    config.helpscout.clientSecret = 'test-client-secret';
    nock.cleanAll();
    nock(host).persist().post('/v2/oauth2/token').reply(200, { access_token: 't', token_type: 'Bearer', expires_in: 3600 });
    handler = new ToolHandler();
  });
  afterEach(() => nock.cleanAll());

  describe('htmlToPlainText', () => {
    it('strips tags, converts breaks and drops quoted history', () => {
      const out = htmlToPlainText('<div>Hoi,<br><br>regel &amp; twee</div><blockquote>eerder</blockquote>');
      expect(out).toBe('Hoi,\n\nregel & twee\n\n[quoted earlier message removed]');
      expect(out).not.toContain('eerder');
    });
    it('cuts gmail quote containers to end of body', () => {
      const out = htmlToPlainText('<p>antwoord</p><div class="gmail_quote">On x wrote:<br>alles</div>');
      expect(out).toBe('antwoord\n\n[quoted earlier message removed]');
    });
  });

  describe('getThreads slimming (#419/#420)', () => {
    it('applies since + maxThreads + stripHtml and reports truncation', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, {
        _embedded: { threads: [
          thread(3, '2026-09-03T10:00:00Z'), thread(2, '2026-09-02T10:00:00Z'), thread(1, '2026-08-01T10:00:00Z'),
        ] }, page: { size: 200, totalElements: 3, totalPages: 1, number: 1 }, _links: {},
      });
      const res = await call(handler, 'getThreads', { conversationId: '1', since: '2026-09-01T00:00:00Z', maxThreads: 1, stripHtml: true });
      const data = JSON.parse((res.content[0] as { text: string }).text);
      expect(data.totalThreads).toBe(3);
      expect(data.returnedThreads).toBe(1);
      expect(data.truncated).toBe(true);
      expect(data.threads[0].id).toBe(3);
      expect(data.threads[0].body).toBe('Hallo,\n\nbericht 3\n\n[quoted earlier message removed]');
      expect(data.threads[0]._links).toBeUndefined();
    });
    it('is unchanged without the new params', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, {
        _embedded: { threads: [thread(1, '2026-08-01T10:00:00Z')] }, page: {}, _links: {},
      });
      const res = await call(handler, 'getThreads', { conversationId: '1' });
      const data = JSON.parse((res.content[0] as { text: string }).text);
      expect(data.truncated).toBe(false);
      expect(data.filters).toBeUndefined();
      expect(data.threads[0].body).toContain('<blockquote>');
    });
  });

  describe('format policy (#95)', () => {
    it('returns FORMAT_POLICY_BLOCKED with structured violations', async () => {
      const res = await call(handler, 'createReply', {
        conversationId: '1', customer: 'k@example.com', draft: true,
        text: 'Hoi — <p>tekst</p> Met vriendelijke groet',
      });
      expect(res.isError).toBe(true);
      const err = JSON.parse((res.content[0] as { text: string }).text).error;
      expect(err.code).toBe('FORMAT_POLICY_BLOCKED');
      expect(err.tool).toBe('createReply');
      expect(err.violations.map((v: { rule: string }) => v.rule)).toEqual(['em_dash', 'forbidden_phrase', 'p_tag']);
      expect(err.violations[1].value).toBe('met vriendelijke groet');
      expect(err.message).not.toMatch(/memory\/|Step 4/);
    });
    it('createMcpToolError keeps generic errors generic', () => {
      const out = createMcpToolError(new Error('boom'), { toolName: 'x', requestId: 'r' });
      expect(JSON.parse((out.content[0] as { text: string }).text).error.code).toBe('TOOL_ERROR');
      expect(new FormatPolicyError('t', []).code).toBe('FORMAT_POLICY_BLOCKED');
    });
  });

  describe('draft-guard + updateReplyDraft (#505/#530)', () => {
    const draftList = { _embedded: { threads: [
      thread(9, '2026-09-06T10:00:00Z', { type: 'message', state: 'draft', body: 'oud concept' }),
      thread(1, '2026-09-01T10:00:00Z'),
    ] }, page: {}, _links: {} };

    it('createReply refuses when a draft exists', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, draftList);
      const res = await call(handler, 'createReply', { conversationId: '1', customer: 'k@example.com', draft: true, text: 'Hoi<br><br>nieuw' });
      expect(res.isError).toBe(true);
      const err = JSON.parse((res.content[0] as { text: string }).text).error;
      expect(err.code).toBe('DRAFT_EXISTS');
      expect(err.existingDraft.threadId).toBe('9');
    });
    it('createReply with replaceExistingDraft patches the draft', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, draftList);
      const patch = nock(host).patch('/v2/conversations/1/threads/9', { op: 'replace', path: '/text', value: 'Hoi<br><br>nieuw' }).reply(204);
      const res = await call(handler, 'createReply', { conversationId: '1', customer: 'k@example.com', draft: true, text: 'Hoi<br><br>nieuw', replaceExistingDraft: true });
      expect(res.isError).toBeUndefined();
      expect(JSON.parse((res.content[0] as { text: string }).text).action).toBe('draft_updated');
      expect(patch.isDone()).toBe(true);
    });
    it('createReply creates when no draft exists', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, { _embedded: { threads: [thread(1, '2026-09-01T10:00:00Z')] }, page: {}, _links: {} });
      const post = nock(host).post('/v2/conversations/1/reply').reply(201);
      const res = await call(handler, 'createReply', { conversationId: '1', customer: 'k@example.com', draft: true, text: 'Hoi<br><br>nieuw' });
      expect(JSON.parse((res.content[0] as { text: string }).text).action).toBe('draft_created');
      expect(post.isDone()).toBe(true);
    });
    it('updateReplyDraft finds the newest draft and enforces the format policy', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, draftList);
      const patch = nock(host).patch('/v2/conversations/1/threads/9').reply(204);
      const ok = await call(handler, 'updateReplyDraft', { conversationId: '1', text: '&lt;strong&gt;Hoi&lt;/strong&gt;' });
      expect(JSON.parse((ok.content[0] as { text: string }).text).threadId).toBe('9');
      expect(patch.isDone()).toBe(true);
      const bad = await call(handler, 'updateReplyDraft', { conversationId: '1', text: 'Hoi — x' });
      expect(JSON.parse((bad.content[0] as { text: string }).text).error.code).toBe('FORMAT_POLICY_BLOCKED');
    });
    it('updateReplyDraft reports NO_DRAFT', async () => {
      nock(host).get('/v2/conversations/1/threads').query(true).reply(200, { _embedded: { threads: [] }, page: {}, _links: {} });
      const res = await call(handler, 'updateReplyDraft', { conversationId: '1', text: 'Hoi' });
      expect(JSON.parse((res.content[0] as { text: string }).text).error.code).toBe('NO_DRAFT');
    });
  });
});
