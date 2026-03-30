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
  type: z.enum(['customer', 'note', 'lineitem', 'phone', 'message', 'forwardparent', 'forwardchild', 'chat', 'beaconchat']),
  status: z.enum(['active', 'pending', 'closed', 'spam']),
  state: z.enum(['published', 'draft', 'hidden']),
  action: z.object({
    type: z.string(),
    text: z.string(),
  }).nullable(),
  body: z.string(),
  linkedConversationId: z.number().nullable().optional(),
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
  sort: z.enum(['createdAt', 'modifiedAt', 'number']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  fields: z.array(z.string()).optional(),
});

export const GetThreadsInputSchema = z.object({
  conversationId: z.string().regex(/^\d+$/, 'Conversation ID must be numeric'),
  limit: z.number().min(1).max(200).default(200),
  cursor: z.string().optional(),
});

export const GetOriginalSourceInputSchema = z.object({
  conversationId: z.string(),
  threadId: z.string(),
});

export const GetConversationSummaryInputSchema = z.object({
  conversationId: z.string().regex(/^\d+$/, 'Conversation ID must be numeric'),
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
export const CreateConversationInputSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  customer: z.string().email('Must be a valid email address'),
  mailboxId: z.number().describe('Inbox ID (e.g. 111589 for KeurigOnline)'),
  text: z.string().min(1, 'Message body is required'),
  status: z.enum(['active', 'closed', 'pending']).default('active'),
  draft: z.boolean().default(true).describe('Create first thread as draft (true) or send immediately (false)'),
  tags: z.array(z.string()).optional(),
  assignTo: z.number().optional().describe('User ID to assign to'),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export const CreateReplyInputSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1, 'Reply text is required'),
  customer: z.string().email('Must be a valid email address'),
  draft: z.boolean().default(true),
  status: z.enum(['active', 'closed', 'pending']).optional(),
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

// Customer API Types

// Shared schema for contact sub-resources (emails, phones, chats, social profiles)
const ContactEntrySchema = z.object({ id: z.number(), value: z.string(), type: z.string() });

export const CustomerSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  gender: z.string().optional(),
  jobTitle: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  organizationId: z.number().nullable().optional(),
  photoType: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
  age: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  conversationCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  draft: z.boolean().optional(),
  _embedded: z.object({
    emails: z.array(ContactEntrySchema).optional(),
    phones: z.array(ContactEntrySchema).optional(),
    chats: z.array(ContactEntrySchema).optional(),
    social_profiles: z.array(ContactEntrySchema).optional(),
    websites: z.array(z.object({ id: z.number(), value: z.string() })).optional(),
    properties: z.array(z.object({
      type: z.string().optional(),
      slug: z.string().optional(),
      name: z.string().optional(),
      value: z.unknown().optional(),
      text: z.string().nullable().optional(),
      source: z.string().nullable().optional(),
    })).optional(),
  }).optional(),
});

export const CustomerAddressSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  lines: z.array(z.string()).optional(),
});

export const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  domains: z.array(z.string()).optional(),
  phones: z.array(z.string()).optional(),
  brandColor: z.string().nullable().optional(),
  customerCount: z.number().optional(),
  conversationCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Customer & Organization Input Schemas
export const GetCustomerInputSchema = z.object({
  customerId: z.string().regex(/^\d+$/, 'Customer ID must be numeric').describe('Customer ID'),
});

export const ListCustomersInputSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  query: z.string().optional().describe('Advanced query syntax, e.g. (email:"john@example.com")'),
  mailbox: z.coerce.number().optional().describe('Filter by inbox ID'),
  modifiedSince: z.string().optional().describe('ISO 8601 date'),
  sortField: z.enum(['createdAt', 'firstName', 'lastName', 'modifiedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
});

export const SearchCustomersByEmailInputSchema = z.object({
  email: z.string().describe('Email address to search for'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  query: z.string().optional(),
  modifiedSince: z.string().optional(),
  createdSince: z.string().optional(),
  cursor: z.string().optional().describe('Cursor for v3 pagination (from nextCursor in previous response)'),
});

export const GetOrganizationInputSchema = z.object({
  organizationId: z.string().regex(/^\d+$/, 'Organization ID must be numeric').describe('Organization ID'),
  includeCounts: z.boolean().default(true),
  includeProperties: z.boolean().default(false),
});

export const ListOrganizationsInputSchema = z.object({
  sortField: z.enum(['name', 'customerCount', 'conversationCount', 'lastInteractionAt']).default('lastInteractionAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
});

export const GetOrganizationMembersInputSchema = z.object({
  organizationId: z.string().regex(/^\d+$/, 'Organization ID must be numeric').describe('Organization ID'),
  page: z.number().min(1).default(1),
});

export const GetOrganizationConversationsInputSchema = z.object({
  organizationId: z.string().regex(/^\d+$/, 'Organization ID must be numeric').describe('Organization ID'),
  page: z.number().min(1).default(1),
});

export const GetCustomerContactsInputSchema = z.object({
  customerId: z.string().regex(/^\d+$/, 'Customer ID must be numeric').describe('Customer ID'),
});

export const ListAllInboxesInputSchema = z.object({
  limit: z.number().min(1).max(100).default(100),
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

// Docs API Input Schemas
export const ListDocsCategoriesInputSchema = z.object({
  collectionId: z.string().optional().describe('Collection ID (uses default if omitted)'),
  sort: z.enum(['order', 'name', 'articleCount', 'createdAt', 'updatedAt']).default('order'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const ListDocsArticlesInputSchema = z.object({
  collectionId: z.string().optional().describe('Collection ID (uses default if omitted)'),
  categoryId: z.string().optional().describe('Filter by category ID'),
  status: z.enum(['all', 'published', 'notpublished']).default('all'),
  sort: z.enum(['number', 'status', 'name', 'popularity', 'createdAt', 'updatedAt']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(50),
});

export const SearchDocsArticlesInputSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  collectionId: z.string().optional().describe('Filter by collection ID'),
  status: z.enum(['all', 'published', 'notpublished']).default('all'),
  page: z.number().min(1).default(1),
});

export const GetDocsArticleInputSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
});

export const CreateDocsArticleInputSchema = z.object({
  collectionId: z.string().optional().describe('Collection ID (uses default if omitted)'),
  name: z.string().min(1, 'Article name is required'),
  text: z.string().min(1, 'Article content is required (HTML or plain text)'),
  categories: z.array(z.string()).optional().describe('Category IDs to assign'),
  status: z.enum(['published', 'notpublished']).default('published'),
  slug: z.string().optional().describe('URL slug (auto-generated if omitted)'),
  keywords: z.array(z.string()).optional().describe('SEO keywords'),
  related: z.array(z.string()).optional().describe('Related article IDs'),
});

export const UpdateDocsArticleInputSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
  name: z.string().optional(),
  text: z.string().optional(),
  categories: z.array(z.string()).optional().describe('Category IDs (omit to keep, null to remove all)'),
  status: z.enum(['published', 'notpublished']).optional(),
  slug: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
});

export const DeleteDocsArticleInputSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
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
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type SearchInboxesInput = z.infer<typeof SearchInboxesInputSchema>;
export type SearchConversationsInput = z.infer<typeof SearchConversationsInputSchema>;
export type GetThreadsInput = z.infer<typeof GetThreadsInputSchema>;
export type GetConversationSummaryInput = z.infer<typeof GetConversationSummaryInputSchema>;
export type AdvancedConversationSearchInput = z.infer<typeof AdvancedConversationSearchInputSchema>;
export type MultiStatusConversationSearchInput = z.infer<typeof MultiStatusConversationSearchInputSchema>;
export type GetCustomerInput = z.infer<typeof GetCustomerInputSchema>;
export type ListCustomersInput = z.infer<typeof ListCustomersInputSchema>;
export type SearchCustomersByEmailInput = z.infer<typeof SearchCustomersByEmailInputSchema>;
export type GetOrganizationInput = z.infer<typeof GetOrganizationInputSchema>;
export type ListOrganizationsInput = z.infer<typeof ListOrganizationsInputSchema>;
export type GetOrganizationMembersInput = z.infer<typeof GetOrganizationMembersInputSchema>;
export type GetOrganizationConversationsInput = z.infer<typeof GetOrganizationConversationsInputSchema>;
export type GetCustomerContactsInput = z.infer<typeof GetCustomerContactsInputSchema>;
export type ListAllInboxesInput = z.infer<typeof ListAllInboxesInputSchema>;
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
export type ListDocsCategoriesInput = z.infer<typeof ListDocsCategoriesInputSchema>;
export type ListDocsArticlesInput = z.infer<typeof ListDocsArticlesInputSchema>;
export type SearchDocsArticlesInput = z.infer<typeof SearchDocsArticlesInputSchema>;
export type GetDocsArticleInput = z.infer<typeof GetDocsArticleInputSchema>;
export type CreateDocsArticleInput = z.infer<typeof CreateDocsArticleInputSchema>;
export type UpdateDocsArticleInput = z.infer<typeof UpdateDocsArticleInputSchema>;
export type DeleteDocsArticleInput = z.infer<typeof DeleteDocsArticleInputSchema>;