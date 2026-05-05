import { z } from 'zod';
export declare const InboxSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    email: z.ZodString;
    slug: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    email: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}, {
    id: number;
    name: string;
    email: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}>;
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodNumber;
    number: z.ZodNumber;
    subject: z.ZodString;
    status: z.ZodEnum<["active", "pending", "closed", "spam"]>;
    state: z.ZodEnum<["published", "draft"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    closedAt: z.ZodNullable<z.ZodString>;
    assignee: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>>;
    customer: z.ZodObject<{
        id: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    mailbox: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
    }, {
        id: number;
        name: string;
    }>;
    tags: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        color: string;
    }, {
        id: number;
        name: string;
        color: string;
    }>, "many">;
    threads: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    number: number;
    id: number;
    createdAt: string;
    updatedAt: string;
    status: "active" | "pending" | "closed" | "spam";
    subject: string;
    state: "published" | "draft";
    closedAt: string | null;
    assignee: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    customer: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    mailbox: {
        id: number;
        name: string;
    };
    tags: {
        id: number;
        name: string;
        color: string;
    }[];
    threads: number;
}, {
    number: number;
    id: number;
    createdAt: string;
    updatedAt: string;
    status: "active" | "pending" | "closed" | "spam";
    subject: string;
    state: "published" | "draft";
    closedAt: string | null;
    assignee: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    customer: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    mailbox: {
        id: number;
        name: string;
    };
    tags: {
        id: number;
        name: string;
        color: string;
    }[];
    threads: number;
}>;
export declare const AttachmentSchema: z.ZodObject<{
    id: z.ZodNumber;
    filename: z.ZodString;
    mimeType: z.ZodString;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    size: z.ZodNumber;
    state: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    size: number;
    id: number;
    filename: string;
    mimeType: string;
    state?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
}, {
    size: number;
    id: number;
    filename: string;
    mimeType: string;
    state?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
}>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export declare const ThreadSchema: z.ZodObject<{
    id: z.ZodNumber;
    type: z.ZodEnum<["customer", "note", "lineitem", "phone", "message", "forwardparent", "forwardchild", "chat", "beaconchat"]>;
    status: z.ZodEnum<["active", "pending", "closed", "spam"]>;
    state: z.ZodEnum<["published", "draft", "hidden"]>;
    action: z.ZodNullable<z.ZodObject<{
        type: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        text: string;
    }, {
        type: string;
        text: string;
    }>>;
    body: z.ZodString;
    linkedConversationId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    source: z.ZodObject<{
        type: z.ZodString;
        via: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        via: string;
    }, {
        type: string;
        via: string;
    }>;
    customer: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>>;
    createdBy: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>>;
    assignedTo: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }, {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    _embedded: z.ZodOptional<z.ZodObject<{
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            filename: z.ZodString;
            mimeType: z.ZodString;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
            size: z.ZodNumber;
            state: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            size: number;
            id: number;
            filename: string;
            mimeType: string;
            state?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }, {
            size: number;
            id: number;
            filename: string;
            mimeType: string;
            state?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        attachments?: {
            size: number;
            id: number;
            filename: string;
            mimeType: string;
            state?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[] | undefined;
    }, {
        attachments?: {
            size: number;
            id: number;
            filename: string;
            mimeType: string;
            state?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    createdAt: string;
    updatedAt: string;
    type: "message" | "customer" | "note" | "lineitem" | "phone" | "forwardparent" | "forwardchild" | "chat" | "beaconchat";
    status: "active" | "pending" | "closed" | "spam";
    state: "published" | "draft" | "hidden";
    customer: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    action: {
        type: string;
        text: string;
    } | null;
    body: string;
    source: {
        type: string;
        via: string;
    };
    createdBy: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    assignedTo: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    linkedConversationId?: number | null | undefined;
    _embedded?: {
        attachments?: {
            size: number;
            id: number;
            filename: string;
            mimeType: string;
            state?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[] | undefined;
    } | undefined;
}, {
    id: number;
    createdAt: string;
    updatedAt: string;
    type: "message" | "customer" | "note" | "lineitem" | "phone" | "forwardparent" | "forwardchild" | "chat" | "beaconchat";
    status: "active" | "pending" | "closed" | "spam";
    state: "published" | "draft" | "hidden";
    customer: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    action: {
        type: string;
        text: string;
    } | null;
    body: string;
    source: {
        type: string;
        via: string;
    };
    createdBy: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    assignedTo: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    } | null;
    linkedConversationId?: number | null | undefined;
    _embedded?: {
        attachments?: {
            size: number;
            id: number;
            filename: string;
            mimeType: string;
            state?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[] | undefined;
    } | undefined;
}>;
export declare const GetAttachmentInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    attachmentId: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, string, string | number>;
    format: z.ZodDefault<z.ZodEnum<["auto", "text", "base64"]>>;
    maxBytes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
    attachmentId: string;
    format: "base64" | "text" | "auto";
    maxBytes: number;
}, {
    conversationId: string;
    attachmentId: string | number;
    format?: "base64" | "text" | "auto" | undefined;
    maxBytes?: number | undefined;
}>;
export declare const SearchInboxesInputSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
    cursor?: string | undefined;
}, {
    query: string;
    limit?: number | undefined;
    cursor?: string | undefined;
}>;
export declare const SearchConversationsInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    inboxId: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "pending", "closed", "spam"]>>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<["createdAt", "modifiedAt", "number"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    sort: "number" | "createdAt" | "modifiedAt";
    limit: number;
    order: "asc" | "desc";
    status?: "active" | "pending" | "closed" | "spam" | undefined;
    query?: string | undefined;
    cursor?: string | undefined;
    inboxId?: string | undefined;
    tag?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    fields?: string[] | undefined;
}, {
    sort?: "number" | "createdAt" | "modifiedAt" | undefined;
    status?: "active" | "pending" | "closed" | "spam" | undefined;
    query?: string | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
    inboxId?: string | undefined;
    tag?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    order?: "asc" | "desc" | undefined;
    fields?: string[] | undefined;
}>;
export declare const GetThreadsInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
    limit: number;
    cursor?: string | undefined;
}, {
    conversationId: string;
    limit?: number | undefined;
    cursor?: string | undefined;
}>;
export declare const GetOriginalSourceInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    threadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
    threadId: string;
}, {
    conversationId: string;
    threadId: string;
}>;
export declare const GetConversationSummaryInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
}, {
    conversationId: string;
}>;
export declare const AdvancedConversationSearchInputSchema: z.ZodObject<{
    contentTerms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subjectTerms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customerEmail: z.ZodOptional<z.ZodString>;
    emailDomain: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    inboxId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "pending", "closed", "spam"]>>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "active" | "pending" | "closed" | "spam" | undefined;
    tags?: string[] | undefined;
    inboxId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    contentTerms?: string[] | undefined;
    subjectTerms?: string[] | undefined;
    customerEmail?: string | undefined;
    emailDomain?: string | undefined;
}, {
    status?: "active" | "pending" | "closed" | "spam" | undefined;
    tags?: string[] | undefined;
    limit?: number | undefined;
    inboxId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    contentTerms?: string[] | undefined;
    subjectTerms?: string[] | undefined;
    customerEmail?: string | undefined;
    emailDomain?: string | undefined;
}>;
export declare const MultiStatusConversationSearchInputSchema: z.ZodObject<{
    searchTerms: z.ZodArray<z.ZodString, "many">;
    inboxId: z.ZodOptional<z.ZodString>;
    statuses: z.ZodDefault<z.ZodArray<z.ZodEnum<["active", "pending", "closed", "spam"]>, "many">>;
    searchIn: z.ZodDefault<z.ZodArray<z.ZodEnum<["body", "subject", "both"]>, "many">>;
    timeframeDays: z.ZodDefault<z.ZodNumber>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    limitPerStatus: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    searchTerms: string[];
    statuses: ("active" | "pending" | "closed" | "spam")[];
    searchIn: ("subject" | "body" | "both")[];
    timeframeDays: number;
    limitPerStatus: number;
    inboxId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
}, {
    searchTerms: string[];
    inboxId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    statuses?: ("active" | "pending" | "closed" | "spam")[] | undefined;
    searchIn?: ("subject" | "body" | "both")[] | undefined;
    timeframeDays?: number | undefined;
    limitPerStatus?: number | undefined;
}>;
export declare const StructuredConversationFilterInputSchema: z.ZodEffects<z.ZodObject<{
    assignedTo: z.ZodOptional<z.ZodNumber>;
    folderId: z.ZodOptional<z.ZodNumber>;
    customerIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    conversationNumber: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["active", "pending", "closed", "spam", "all"]>>;
    inboxId: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    modifiedSince: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "modifiedAt", "number", "waitingSince", "customerName", "customerEmail", "mailboxId", "status", "subject"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "pending" | "closed" | "spam" | "all";
    limit: number;
    sortBy: "number" | "createdAt" | "status" | "subject" | "modifiedAt" | "customerEmail" | "waitingSince" | "customerName" | "mailboxId";
    sortOrder: "asc" | "desc";
    assignedTo?: number | undefined;
    cursor?: string | undefined;
    inboxId?: string | undefined;
    tag?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    folderId?: number | undefined;
    customerIds?: number[] | undefined;
    conversationNumber?: number | undefined;
    modifiedSince?: string | undefined;
}, {
    status?: "active" | "pending" | "closed" | "spam" | "all" | undefined;
    assignedTo?: number | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
    inboxId?: string | undefined;
    tag?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    folderId?: number | undefined;
    customerIds?: number[] | undefined;
    conversationNumber?: number | undefined;
    modifiedSince?: string | undefined;
    sortBy?: "number" | "createdAt" | "status" | "subject" | "modifiedAt" | "customerEmail" | "waitingSince" | "customerName" | "mailboxId" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>, {
    status: "active" | "pending" | "closed" | "spam" | "all";
    limit: number;
    sortBy: "number" | "createdAt" | "status" | "subject" | "modifiedAt" | "customerEmail" | "waitingSince" | "customerName" | "mailboxId";
    sortOrder: "asc" | "desc";
    assignedTo?: number | undefined;
    cursor?: string | undefined;
    inboxId?: string | undefined;
    tag?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    folderId?: number | undefined;
    customerIds?: number[] | undefined;
    conversationNumber?: number | undefined;
    modifiedSince?: string | undefined;
}, {
    status?: "active" | "pending" | "closed" | "spam" | "all" | undefined;
    assignedTo?: number | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
    inboxId?: string | undefined;
    tag?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    folderId?: number | undefined;
    customerIds?: number[] | undefined;
    conversationNumber?: number | undefined;
    modifiedSince?: string | undefined;
    sortBy?: "number" | "createdAt" | "status" | "subject" | "modifiedAt" | "customerEmail" | "waitingSince" | "customerName" | "mailboxId" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const CreateConversationInputSchema: z.ZodObject<{
    subject: z.ZodString;
    customer: z.ZodString;
    mailboxId: z.ZodNumber;
    text: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "closed", "pending"]>>;
    draft: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignTo: z.ZodOptional<z.ZodNumber>;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "pending" | "closed";
    subject: string;
    draft: boolean;
    customer: string;
    text: string;
    mailboxId: number;
    tags?: string[] | undefined;
    assignTo?: number | undefined;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
}, {
    subject: string;
    customer: string;
    text: string;
    mailboxId: number;
    status?: "active" | "pending" | "closed" | undefined;
    draft?: boolean | undefined;
    tags?: string[] | undefined;
    assignTo?: number | undefined;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
}>;
export declare const CreateReplyInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    text: z.ZodString;
    customer: z.ZodString;
    draft: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodEnum<["active", "closed", "pending"]>>;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    draft: boolean;
    customer: string;
    text: string;
    conversationId: string;
    status?: "active" | "pending" | "closed" | undefined;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
}, {
    customer: string;
    text: string;
    conversationId: string;
    status?: "active" | "pending" | "closed" | undefined;
    draft?: boolean | undefined;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
}>;
export declare const CreateNoteInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    conversationId: string;
}, {
    text: string;
    conversationId: string;
}>;
export declare const UpdateConversationStatusInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    status: z.ZodEnum<["active", "pending", "closed"]>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "pending" | "closed";
    conversationId: string;
}, {
    status: "active" | "pending" | "closed";
    conversationId: string;
}>;
export declare const UpdateConversationTagsInputSchema: z.ZodObject<{
    conversationId: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    conversationId: string;
}, {
    tags: string[];
    conversationId: string;
}>;
export declare const CustomerSchema: z.ZodObject<{
    id: z.ZodNumber;
    firstName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    gender: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    organizationId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    photoType: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    age: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    background: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversationCount: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    draft: z.ZodOptional<z.ZodBoolean>;
    _embedded: z.ZodOptional<z.ZodObject<{
        emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            value: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            value: string;
            type: string;
        }, {
            id: number;
            value: string;
            type: string;
        }>, "many">>;
        phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            value: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            value: string;
            type: string;
        }, {
            id: number;
            value: string;
            type: string;
        }>, "many">>;
        chats: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            value: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            value: string;
            type: string;
        }, {
            id: number;
            value: string;
            type: string;
        }>, "many">>;
        social_profiles: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            value: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            value: string;
            type: string;
        }, {
            id: number;
            value: string;
            type: string;
        }>, "many">>;
        websites: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            value: string;
        }, {
            id: number;
            value: string;
        }>, "many">>;
        properties: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            slug: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            value: z.ZodOptional<z.ZodUnknown>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            source: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            slug?: string | undefined;
            value?: unknown;
            type?: string | undefined;
            text?: string | null | undefined;
            source?: string | null | undefined;
        }, {
            name?: string | undefined;
            slug?: string | undefined;
            value?: unknown;
            type?: string | undefined;
            text?: string | null | undefined;
            source?: string | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        emails?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        phones?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        chats?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        social_profiles?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        websites?: {
            id: number;
            value: string;
        }[] | undefined;
        properties?: {
            name?: string | undefined;
            slug?: string | undefined;
            value?: unknown;
            type?: string | undefined;
            text?: string | null | undefined;
            source?: string | null | undefined;
        }[] | undefined;
    }, {
        emails?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        phones?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        chats?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        social_profiles?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        websites?: {
            id: number;
            value: string;
        }[] | undefined;
        properties?: {
            name?: string | undefined;
            slug?: string | undefined;
            value?: unknown;
            type?: string | undefined;
            text?: string | null | undefined;
            source?: string | null | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    createdAt: string;
    updatedAt: string;
    draft?: boolean | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    _embedded?: {
        emails?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        phones?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        chats?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        social_profiles?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        websites?: {
            id: number;
            value: string;
        }[] | undefined;
        properties?: {
            name?: string | undefined;
            slug?: string | undefined;
            value?: unknown;
            type?: string | undefined;
            text?: string | null | undefined;
            source?: string | null | undefined;
        }[] | undefined;
    } | undefined;
    gender?: string | undefined;
    jobTitle?: string | null | undefined;
    location?: string | null | undefined;
    organizationId?: number | null | undefined;
    photoType?: string | undefined;
    photoUrl?: string | null | undefined;
    age?: string | null | undefined;
    background?: string | null | undefined;
    conversationCount?: number | undefined;
}, {
    id: number;
    createdAt: string;
    updatedAt: string;
    draft?: boolean | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    _embedded?: {
        emails?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        phones?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        chats?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        social_profiles?: {
            id: number;
            value: string;
            type: string;
        }[] | undefined;
        websites?: {
            id: number;
            value: string;
        }[] | undefined;
        properties?: {
            name?: string | undefined;
            slug?: string | undefined;
            value?: unknown;
            type?: string | undefined;
            text?: string | null | undefined;
            source?: string | null | undefined;
        }[] | undefined;
    } | undefined;
    gender?: string | undefined;
    jobTitle?: string | null | undefined;
    location?: string | null | undefined;
    organizationId?: number | null | undefined;
    photoType?: string | undefined;
    photoUrl?: string | null | undefined;
    age?: string | null | undefined;
    background?: string | null | undefined;
    conversationCount?: number | undefined;
}>;
export declare const CustomerAddressSchema: z.ZodObject<{
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    lines: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    state?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    lines?: string[] | undefined;
}, {
    state?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    lines?: string[] | undefined;
}>;
export declare const OrganizationSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    domains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    phones: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    brandColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerCount: z.ZodOptional<z.ZodNumber>;
    conversationCount: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    note?: string | null | undefined;
    location?: string | null | undefined;
    conversationCount?: number | undefined;
    phones?: string[] | undefined;
    website?: string | null | undefined;
    description?: string | null | undefined;
    logoUrl?: string | null | undefined;
    domains?: string[] | undefined;
    brandColor?: string | null | undefined;
    customerCount?: number | undefined;
}, {
    id: number;
    name: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    note?: string | null | undefined;
    location?: string | null | undefined;
    conversationCount?: number | undefined;
    phones?: string[] | undefined;
    website?: string | null | undefined;
    description?: string | null | undefined;
    logoUrl?: string | null | undefined;
    domains?: string[] | undefined;
    brandColor?: string | null | undefined;
    customerCount?: number | undefined;
}>;
export declare const GetCustomerInputSchema: z.ZodObject<{
    customerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customerId: string;
}, {
    customerId: string;
}>;
export declare const ListCustomersInputSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    mailbox: z.ZodOptional<z.ZodNumber>;
    modifiedSince: z.ZodOptional<z.ZodString>;
    sortField: z.ZodDefault<z.ZodEnum<["createdAt", "firstName", "lastName", "modifiedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    sortField: "createdAt" | "firstName" | "lastName" | "modifiedAt";
    page: number;
    firstName?: string | undefined;
    lastName?: string | undefined;
    mailbox?: number | undefined;
    query?: string | undefined;
    modifiedSince?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    mailbox?: number | undefined;
    query?: string | undefined;
    modifiedSince?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    sortField?: "createdAt" | "firstName" | "lastName" | "modifiedAt" | undefined;
    page?: number | undefined;
}>;
export declare const SearchCustomersByEmailInputSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    modifiedSince: z.ZodOptional<z.ZodString>;
    createdSince: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    query?: string | undefined;
    cursor?: string | undefined;
    modifiedSince?: string | undefined;
    createdSince?: string | undefined;
}, {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    query?: string | undefined;
    cursor?: string | undefined;
    modifiedSince?: string | undefined;
    createdSince?: string | undefined;
}>;
export declare const GetOrganizationInputSchema: z.ZodObject<{
    organizationId: z.ZodString;
    includeCounts: z.ZodDefault<z.ZodBoolean>;
    includeProperties: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    includeCounts: boolean;
    includeProperties: boolean;
}, {
    organizationId: string;
    includeCounts?: boolean | undefined;
    includeProperties?: boolean | undefined;
}>;
export declare const ListOrganizationsInputSchema: z.ZodObject<{
    sortField: z.ZodDefault<z.ZodEnum<["name", "customerCount", "conversationCount", "lastInteractionAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    sortField: "name" | "conversationCount" | "customerCount" | "lastInteractionAt";
    page: number;
}, {
    sortOrder?: "asc" | "desc" | undefined;
    sortField?: "name" | "conversationCount" | "customerCount" | "lastInteractionAt" | undefined;
    page?: number | undefined;
}>;
export declare const GetOrganizationMembersInputSchema: z.ZodObject<{
    organizationId: z.ZodString;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    page: number;
}, {
    organizationId: string;
    page?: number | undefined;
}>;
export declare const GetOrganizationConversationsInputSchema: z.ZodObject<{
    organizationId: z.ZodString;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    page: number;
}, {
    organizationId: string;
    page?: number | undefined;
}>;
export declare const GetCustomerContactsInputSchema: z.ZodObject<{
    customerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customerId: string;
}, {
    customerId: string;
}>;
export declare const ListAllInboxesInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
}, {
    limit?: number | undefined;
}>;
export declare const ReportBaseInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}>;
export declare const GetCompanyReportInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}>;
export declare const GetCompanyCustomersHelpedInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
} & {
    viewBy: z.ZodOptional<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    viewBy?: "day" | "week" | "month" | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    viewBy?: "day" | "week" | "month" | undefined;
}>;
export declare const GetCompanyDrilldownInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodOptional<z.ZodNumber>;
    rows: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodString>;
    rangeId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    page?: number | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    rows?: number | undefined;
    range?: string | undefined;
    rangeId?: number | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    page?: number | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    rows?: number | undefined;
    range?: string | undefined;
    rangeId?: number | undefined;
}>;
export declare const GetConversationsReportInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}>;
export declare const GetProductivityReportInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
} & {
    officeHours: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    officeHours?: boolean | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    officeHours?: boolean | undefined;
}>;
export declare const GetEmailReportInputSchema: z.ZodObject<Omit<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
}, "types"> & {
    officeHours: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    folders?: string | undefined;
    officeHours?: boolean | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    folders?: string | undefined;
    officeHours?: boolean | undefined;
}>;
export declare const GetFirstResponseTimeReportInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
} & {
    officeHours: z.ZodOptional<z.ZodBoolean>;
    viewBy: z.ZodOptional<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    viewBy?: "day" | "week" | "month" | undefined;
    officeHours?: boolean | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    viewBy?: "day" | "week" | "month" | undefined;
    officeHours?: boolean | undefined;
}>;
export declare const GetResolutionTimeReportInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
} & {
    officeHours: z.ZodOptional<z.ZodBoolean>;
    viewBy: z.ZodOptional<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    viewBy?: "day" | "week" | "month" | undefined;
    officeHours?: boolean | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    viewBy?: "day" | "week" | "month" | undefined;
    officeHours?: boolean | undefined;
}>;
export declare const GetHappinessReportInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
}>;
export declare const GetHappinessRatingsInputSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
    previousStart: z.ZodOptional<z.ZodString>;
    previousEnd: z.ZodOptional<z.ZodString>;
    mailboxes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodString>;
    folders: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodOptional<z.ZodNumber>;
    sortField: z.ZodOptional<z.ZodEnum<["rating", "date"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    rating: z.ZodOptional<z.ZodEnum<["great", "ok", "not-good"]>>;
}, "strip", z.ZodTypeAny, {
    start: string;
    end: string;
    tags?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    sortField?: "date" | "rating" | undefined;
    page?: number | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    rating?: "great" | "ok" | "not-good" | undefined;
}, {
    start: string;
    end: string;
    tags?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    sortField?: "date" | "rating" | undefined;
    page?: number | undefined;
    previousStart?: string | undefined;
    previousEnd?: string | undefined;
    mailboxes?: string | undefined;
    types?: string | undefined;
    folders?: string | undefined;
    rating?: "great" | "ok" | "not-good" | undefined;
}>;
export declare const ListDocsCategoriesInputSchema: z.ZodObject<{
    collectionId: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<["order", "name", "articleCount", "createdAt", "updatedAt"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sort: "name" | "createdAt" | "updatedAt" | "order" | "articleCount";
    order: "asc" | "desc";
    collectionId?: string | undefined;
}, {
    sort?: "name" | "createdAt" | "updatedAt" | "order" | "articleCount" | undefined;
    order?: "asc" | "desc" | undefined;
    collectionId?: string | undefined;
}>;
export declare const ListDocsArticlesInputSchema: z.ZodObject<{
    collectionId: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["all", "published", "notpublished"]>>;
    sort: z.ZodDefault<z.ZodEnum<["number", "status", "name", "popularity", "createdAt", "updatedAt"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sort: "number" | "name" | "createdAt" | "updatedAt" | "status" | "popularity";
    status: "published" | "all" | "notpublished";
    order: "asc" | "desc";
    page: number;
    pageSize: number;
    collectionId?: string | undefined;
    categoryId?: string | undefined;
}, {
    sort?: "number" | "name" | "createdAt" | "updatedAt" | "status" | "popularity" | undefined;
    status?: "published" | "all" | "notpublished" | undefined;
    order?: "asc" | "desc" | undefined;
    page?: number | undefined;
    collectionId?: string | undefined;
    categoryId?: string | undefined;
    pageSize?: number | undefined;
}>;
export declare const SearchDocsArticlesInputSchema: z.ZodObject<{
    query: z.ZodString;
    collectionId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["all", "published", "notpublished"]>>;
    page: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "published" | "all" | "notpublished";
    query: string;
    page: number;
    collectionId?: string | undefined;
}, {
    query: string;
    status?: "published" | "all" | "notpublished" | undefined;
    page?: number | undefined;
    collectionId?: string | undefined;
}>;
export declare const GetDocsArticleInputSchema: z.ZodObject<{
    articleId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    articleId: string;
}, {
    articleId: string;
}>;
export declare const CreateDocsArticleInputSchema: z.ZodObject<{
    collectionId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    text: z.ZodString;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodEnum<["published", "notpublished"]>>;
    slug: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    related: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status: "published" | "notpublished";
    text: string;
    slug?: string | undefined;
    collectionId?: string | undefined;
    categories?: string[] | undefined;
    keywords?: string[] | undefined;
    related?: string[] | undefined;
}, {
    name: string;
    text: string;
    slug?: string | undefined;
    status?: "published" | "notpublished" | undefined;
    collectionId?: string | undefined;
    categories?: string[] | undefined;
    keywords?: string[] | undefined;
    related?: string[] | undefined;
}>;
export declare const UpdateDocsArticleInputSchema: z.ZodObject<{
    articleId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodEnum<["published", "notpublished"]>>;
    slug: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    related: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    articleId: string;
    name?: string | undefined;
    slug?: string | undefined;
    status?: "published" | "notpublished" | undefined;
    text?: string | undefined;
    categories?: string[] | undefined;
    keywords?: string[] | undefined;
    related?: string[] | undefined;
}, {
    articleId: string;
    name?: string | undefined;
    slug?: string | undefined;
    status?: "published" | "notpublished" | undefined;
    text?: string | undefined;
    categories?: string[] | undefined;
    keywords?: string[] | undefined;
    related?: string[] | undefined;
}>;
export declare const DeleteDocsArticleInputSchema: z.ZodObject<{
    articleId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    articleId: string;
}, {
    articleId: string;
}>;
export declare const ServerTimeSchema: z.ZodObject<{
    isoTime: z.ZodString;
    unixTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    isoTime: string;
    unixTime: number;
}, {
    isoTime: string;
    unixTime: number;
}>;
export declare const ErrorSchema: z.ZodObject<{
    code: z.ZodEnum<["INVALID_INPUT", "NOT_FOUND", "UNAUTHORIZED", "RATE_LIMIT", "UPSTREAM_ERROR"]>;
    message: z.ZodString;
    retryAfter: z.ZodOptional<z.ZodNumber>;
    details: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    code: "INVALID_INPUT" | "NOT_FOUND" | "UNAUTHORIZED" | "RATE_LIMIT" | "UPSTREAM_ERROR";
    message: string;
    details: Record<string, unknown>;
    retryAfter?: number | undefined;
}, {
    code: "INVALID_INPUT" | "NOT_FOUND" | "UNAUTHORIZED" | "RATE_LIMIT" | "UPSTREAM_ERROR";
    message: string;
    retryAfter?: number | undefined;
    details?: Record<string, unknown> | undefined;
}>;
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
//# sourceMappingURL=types.d.ts.map