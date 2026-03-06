import { z } from 'zod';

// Help Scout API Types
export const InboxSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ConversationSchema = z.object({
  id: z.number(),
  number: z.number(),
  subject: z.string(),
  status: z.enum(['active', 'pending', 'closed', 'spam']),
  state: z.enum(['published', 'draft']),
  createdAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().nullable(),
  assignee: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }).nullable(),
  customer: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  mailbox: z.object({
    id: z.number(),
    name: z.string(),
  }),
  tags: z.array(z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
  })),
  threads: z.number(),
});

export const ThreadSchema = z.object({
  id: z.number(),
  type: z.enum(['customer', 'note', 'lineitem', 'phone', 'message']),
  status: z.enum(['active', 'pending', 'closed', 'spam']),
  state: z.enum(['published', 'draft', 'hidden']),
  action: z.object({
    type: z.string(),
    text: z.string(),
  }).nullable(),
  body: z.string(),
  source: z.object({
    type: z.string(),
    via: z.string(),
  }),
  customer: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }).nullable(),
  createdBy: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }).nullable(),
  assignedTo: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// MCP Tool Input Schemas
export const SearchInboxesInputSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const SearchConversationsInputSchema = z.object({
  query: z.string().optional(),
  inboxId: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['active', 'pending', 'closed', 'spam']).optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'number']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  fields: z.array(z.string()).optional(),
});

export const GetThreadsInputSchema = z.object({
  conversationId: z.string(),
  limit: z.number().min(1).max(200).default(200),
  cursor: z.string().optional(),
});

export const GetConversationSummaryInputSchema = z.object({
  conversationId: z.string(),
});

export const AdvancedConversationSearchInputSchema = z.object({
  contentTerms: z.array(z.string()).optional(),
  subjectTerms: z.array(z.string()).optional(),
  customerEmail: z.string().optional(),
  emailDomain: z.string().optional(),
  tags: z.array(z.string()).optional(),
  inboxId: z.string().optional(),
  status: z.enum(['active', 'pending', 'closed', 'spam']).optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export const MultiStatusConversationSearchInputSchema = z.object({
  searchTerms: z.array(z.string()).min(1, 'At least one search term is required'),
  inboxId: z.string().optional(),
  statuses: z.array(z.enum(['active', 'pending', 'closed', 'spam'])).default(['active', 'pending', 'closed']),
  searchIn: z.array(z.enum(['body', 'subject', 'both'])).default(['both']),
  timeframeDays: z.number().min(1).max(365).default(60),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  limitPerStatus: z.number().min(1).max(100).default(25),
  includeVariations: z.boolean().default(true),
});

export const StructuredConversationFilterInputSchema = z.object({
  assignedTo: z.number().int().min(-1).describe('User ID (-1 for unassigned)').optional(),
  folderId: z.number().int().min(0).describe('Folder ID must be positive').optional(),
  customerIds: z.array(z.number().int().min(0)).max(100).describe('Max 100 customer IDs').optional(),
  conversationNumber: z.number().int().min(1).describe('Conversation number must be positive').optional(),
  status: z.enum(['active', 'pending', 'closed', 'spam', 'all']).default('all'),
  inboxId: z.string().optional(),
  tag: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  modifiedSince: z.string().optional(),
  sortBy: z.enum(['createdAt', 'modifiedAt', 'number', 'waitingSince', 'customerName', 'customerEmail', 'mailboxId', 'status', 'subject']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
}).refine(
  (data) => !!(data.assignedTo !== undefined || data.folderId !== undefined || data.customerIds !== undefined || data.conversationNumber !== undefined || (data.sortBy && ['waitingSince', 'customerName', 'customerEmail'].includes(data.sortBy))),
  { message: 'Must use at least one unique field: assignedTo, folderId, customerIds, conversationNumber, or unique sorting. For content search, use comprehensiveConversationSearch.' }
);

// Write Tool Input Schemas
export const CreateReplyInputSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1, 'Reply text is required'),
  customer: z.string().email('Must be a valid email address'),
  draft: z.boolean().default(true),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export const CreateNoteInputSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1, 'Note text is required'),
});

export const UpdateConversationStatusInputSchema = z.object({
  conversationId: z.string(),
  status: z.enum(['active', 'pending', 'closed']),
});

export const UpdateConversationTagsInputSchema = z.object({
  conversationId: z.string(),
  tags: z.array(z.string()).describe('List of tags to apply. Non-existing tags will be created. Send empty array to remove all tags.'),
});

// Report Input Schemas
export const ReportBaseInputSchema = z.object({
  start: z.string().describe('Start date (ISO8601, required)'),
  end: z.string().describe('End date (ISO8601, required)'),
  previousStart: z.string().optional().describe('Previous period start for comparison'),
  previousEnd: z.string().optional().describe('Previous period end for comparison'),
  mailboxes: z.string().optional().describe('Comma-separated mailbox IDs'),
  tags: z.string().optional().describe('Comma-separated tag IDs'),
  types: z.string().optional().describe('Comma-separated conversation types (email, phone, chat)'),
  folders: z.string().optional().describe('Comma-separated folder IDs'),
});

export const GetCompanyReportInputSchema = ReportBaseInputSchema;

export const GetCompanyCustomersHelpedInputSchema = ReportBaseInputSchema.extend({
  viewBy: z.enum(['day', 'week', 'month']).optional().describe('Time grouping for the data'),
});

export const GetCompanyDrilldownInputSchema = ReportBaseInputSchema.extend({
  page: z.number().min(1).optional().describe('Page number'),
  rows: z.number().min(1).max(100).optional().describe('Results per page'),
  range: z.string().optional().describe('Metric range to drill into'),
  rangeId: z.number().optional().describe('Range ID for specific metric'),
});

export const GetConversationsReportInputSchema = ReportBaseInputSchema;

export const GetProductivityReportInputSchema = ReportBaseInputSchema.extend({
  officeHours: z.boolean().optional().describe('Calculate times using office hours only'),
});

export const GetEmailReportInputSchema = ReportBaseInputSchema.omit({ types: true }).extend({
  officeHours: z.boolean().optional().describe('Calculate times using office hours only'),
});

export const GetFirstResponseTimeReportInputSchema = ReportBaseInputSchema.extend({
  officeHours: z.boolean().optional().describe('Calculate times using office hours only'),
  viewBy: z.enum(['day', 'week', 'month']).optional().describe('Time grouping for the data'),
});

export const GetResolutionTimeReportInputSchema = ReportBaseInputSchema.extend({
  officeHours: z.boolean().optional().describe('Calculate times using office hours only'),
  viewBy: z.enum(['day', 'week', 'month']).optional().describe('Time grouping for the data'),
});

export const GetHappinessReportInputSchema = ReportBaseInputSchema;

export const GetHappinessRatingsInputSchema = ReportBaseInputSchema.extend({
  page: z.number().min(1).optional().describe('Page number'),
  sortField: z.enum(['rating', 'date']).optional().describe('Sort field'),
  sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  rating: z.enum(['great', 'ok', 'not-good']).optional().describe('Filter by rating type'),
});

// Response Types
export const ServerTimeSchema = z.object({
  isoTime: z.string(),
  unixTime: z.number(),
});

export const ErrorSchema = z.object({
  code: z.enum(['INVALID_INPUT', 'NOT_FOUND', 'UNAUTHORIZED', 'RATE_LIMIT', 'UPSTREAM_ERROR']),
  message: z.string(),
  retryAfter: z.number().optional(),
  details: z.record(z.unknown()).default({}),
});

// Type exports
export type Inbox = z.infer<typeof InboxSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Thread = z.infer<typeof ThreadSchema>;
export type SearchInboxesInput = z.infer<typeof SearchInboxesInputSchema>;
export type SearchConversationsInput = z.infer<typeof SearchConversationsInputSchema>;
export type GetThreadsInput = z.infer<typeof GetThreadsInputSchema>;
export type GetConversationSummaryInput = z.infer<typeof GetConversationSummaryInputSchema>;
export type AdvancedConversationSearchInput = z.infer<typeof AdvancedConversationSearchInputSchema>;
export type MultiStatusConversationSearchInput = z.infer<typeof MultiStatusConversationSearchInputSchema>;
export type ServerTime = z.infer<typeof ServerTimeSchema>;
export type CreateReplyInput = z.infer<typeof CreateReplyInputSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export type UpdateConversationStatusInput = z.infer<typeof UpdateConversationStatusInputSchema>;
export type ApiError = z.infer<typeof ErrorSchema>;
export type ReportBaseInput = z.infer<typeof ReportBaseInputSchema>;
export type GetCompanyReportInput = z.infer<typeof GetCompanyReportInputSchema>;
export type GetCompanyCustomersHelpedInput = z.infer<typeof GetCompanyCustomersHelpedInputSchema>;
export type GetCompanyDrilldownInput = z.infer<typeof GetCompanyDrilldownInputSchema>;
export type GetConversationsReportInput = z.infer<typeof GetConversationsReportInputSchema>;
export type GetProductivityReportInput = z.infer<typeof GetProductivityReportInputSchema>;
export type GetEmailReportInput = z.infer<typeof GetEmailReportInputSchema>;
export type GetFirstResponseTimeReportInput = z.infer<typeof GetFirstResponseTimeReportInputSchema>;
export type GetResolutionTimeReportInput = z.infer<typeof GetResolutionTimeReportInputSchema>;
export type GetHappinessReportInput = z.infer<typeof GetHappinessReportInputSchema>;
export type GetHappinessRatingsInput = z.infer<typeof GetHappinessRatingsInputSchema>;