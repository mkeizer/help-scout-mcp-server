# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that connects AI assistants to Help Scout customer support data. It exposes Help Scout conversations, threads, and inboxes as MCP tools, resources, and prompts. Published on npm as `help-scout-mcp-server`.

## Commands

```bash
npm run build          # TypeScript compile (tsc) → dist/
npm run dev            # Dev server with tsx (auto-reload)
npm start              # Run compiled server (dist/index.js)
npm test               # Jest test suite
npm run type-check     # tsc --noEmit
npm run lint           # ESLint
npm run mcpb:pack      # Build Desktop Extension (.mcpb file)
```

Run a single test file:
```bash
npx jest src/__tests__/tools.test.ts
```

Tests use ESM via ts-jest. The jest config maps `.js` imports back to `.ts` sources (`moduleNameMapper`).

## Architecture

### Entry Point & Server Lifecycle

`src/index.ts` — `HelpScoutMCPServer` class uses an async factory pattern (`HelpScoutMCPServer.create()`) that discovers inboxes via the Help Scout API before instantiating the MCP server. Discovered inbox IDs are embedded into the server's `instructions` string so AI clients know which inboxes exist without a separate lookup.

### Module Layout

| Module | Purpose |
|--------|---------|
| `src/tools/index.ts` | `ToolHandler` — all MCP tool definitions and implementations (search, threads, replies, notes, status updates). This is the largest file. |
| `src/tools/reports.ts` | `ReportToolHandler` — reporting tools (company, productivity, happiness, etc.) |
| `src/tools/docs.ts` | `DocsToolHandler` — Help Scout Docs API CRUD tools (articles, categories, search) |
| `src/schema/types.ts` | Zod schemas for Help Scout API types (Inbox, Conversation, Thread) and tool input validation schemas |
| `src/resources/index.ts` | `ResourceHandler` — MCP resources via `helpscout://` URI scheme |
| `src/prompts/index.ts` | `PromptHandler` — MCP prompts (best practices guide, search templates) |
| `src/utils/helpscout-client.ts` | `HelpScoutClient` — Axios-based HTTP client with OAuth2 Client Credentials auth, automatic token refresh, retry with exponential backoff, connection pooling, and LRU caching |
| `src/utils/docs-client.ts` | `DocsClient` — Axios-based HTTP client for Help Scout Docs API (HTTP Basic Auth, separate from Mailbox API) |
| `src/utils/config.ts` | Environment variable configuration with `validateConfig()` |
| `src/utils/api-constraints.ts` | Validation rules that check tool call arguments against Help Scout API constraints before execution |
| `src/utils/cache.ts` | LRU cache (SHA-256 keyed) wrapping `lru-cache` |
| `src/utils/mcp-errors.ts` | Standardized MCP error response formatting |
| `src/utils/logger.ts` | Structured logging |

### Key Patterns

- **OAuth2 Client Credentials flow** — the server authenticates with `HELPSCOUT_APP_ID` + `HELPSCOUT_APP_SECRET` (no personal access tokens). Token refresh is automatic.
- **Zod everywhere** — all tool inputs are validated with Zod schemas defined in `schema/types.ts`. Tool input schemas are imported by name (e.g., `SearchConversationsInputSchema`).
- **Query injection prevention** — `ToolHandler.escapeQueryTerm()` escapes Help Scout query syntax characters in user-provided search terms.
- **PII redaction** — when `REDACT_MESSAGE_CONTENT=true`, message bodies are hidden from responses.
- **Two API clients** — `HelpScoutClient` (OAuth2, Mailbox API) and `DocsClient` (API key basic auth, Docs API). They use different auth flows and base URLs.
- **ESM throughout** — the project uses ES modules (`"type": "module"` in package.json). All internal imports use `.js` extensions (resolved to `.ts` by ts-jest in tests).

### Environment Variables

Required: `HELPSCOUT_APP_ID`, `HELPSCOUT_APP_SECRET`

Optional: `HELPSCOUT_DEFAULT_INBOX_ID`, `REDACT_MESSAGE_CONTENT`, `CACHE_TTL_SECONDS`, `LOG_LEVEL`

Docs API (optional): `HELPSCOUT_DOCS_API_KEY`, `HELPSCOUT_DOCS_COLLECTION_ID`

### Testing

Tests live in `src/__tests__/`. They use `nock` for HTTP mocking. The test environment sets `NODE_ENV=test` which skips `.env` loading and prevents the server from auto-starting.

Coverage thresholds are enforced: branches 67%, functions 62%, lines 68%, statements 67%.
