import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { docsClient } from '../utils/docs-client.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import {
  ListDocsCategoriesInputSchema,
  ListDocsArticlesInputSchema,
  SearchDocsArticlesInputSchema,
  GetDocsArticleInputSchema,
  CreateDocsArticleInputSchema,
  UpdateDocsArticleInputSchema,
  DeleteDocsArticleInputSchema,
} from '../schema/types.js';

export class DocsToolHandler {
  private toResult(data: unknown): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }

  private getCollectionId(provided?: string): string {
    const id = provided || config.docs.collectionId;
    if (!id) {
      throw new Error(
        'No collection ID provided. Set HELPSCOUT_DOCS_COLLECTION_ID or pass collectionId parameter.'
      );
    }
    return id;
  }

  /**
   * Returns the list of Docs tools. Returns empty array if Docs API key is not configured.
   */
  listTools(): Tool[] {
    if (!docsClient.isConfigured()) {
      return [];
    }

    return [
      {
        name: 'listDocsCategories',
        description: 'List categories in the Help Scout Docs knowledge base. Returns category names, IDs, and article counts.',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: {
              type: 'string',
              description: 'Collection ID (uses default if omitted)',
            },
            sort: {
              type: 'string',
              enum: ['order', 'name', 'articleCount', 'createdAt', 'updatedAt'],
              default: 'order',
              description: 'Sort field',
            },
            order: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc',
              description: 'Sort order',
            },
          },
        },
      },
      {
        name: 'listDocsArticles',
        description: 'List articles in the Help Scout Docs knowledge base, optionally filtered by category.',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: {
              type: 'string',
              description: 'Collection ID (uses default if omitted)',
            },
            categoryId: {
              type: 'string',
              description: 'Filter by category ID',
            },
            status: {
              type: 'string',
              enum: ['all', 'published', 'notpublished'],
              default: 'all',
              description: 'Filter by publish status',
            },
            sort: {
              type: 'string',
              enum: ['number', 'status', 'name', 'popularity', 'createdAt', 'updatedAt'],
              default: 'updatedAt',
              description: 'Sort field',
            },
            order: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
              description: 'Sort order',
            },
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number',
            },
            pageSize: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 50,
              description: 'Results per page (max 100)',
            },
          },
        },
      },
      {
        name: 'searchDocsArticles',
        description: 'Search Help Scout Docs articles by keyword. Returns matching article titles, URLs, and previews.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            collectionId: {
              type: 'string',
              description: 'Filter by collection ID',
            },
            status: {
              type: 'string',
              enum: ['all', 'published', 'notpublished'],
              default: 'all',
              description: 'Filter by publish status',
            },
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'getDocsArticle',
        description: 'Get a single Help Scout Docs article by ID, including full HTML content.',
        inputSchema: {
          type: 'object',
          properties: {
            articleId: {
              type: 'string',
              description: 'The article ID',
            },
          },
          required: ['articleId'],
        },
      },
      {
        name: 'createDocsArticle',
        description: 'Create a new article in Help Scout Docs. Content can be HTML or plain text. Publishes by default.',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: {
              type: 'string',
              description: 'Collection ID (uses default if omitted)',
            },
            name: {
              type: 'string',
              description: 'Article title (must be unique in the collection)',
            },
            text: {
              type: 'string',
              description: 'Article content (HTML or plain text)',
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Category IDs to assign',
            },
            status: {
              type: 'string',
              enum: ['published', 'notpublished'],
              default: 'published',
              description: 'Publish status',
            },
            slug: {
              type: 'string',
              description: 'URL slug (auto-generated if omitted)',
            },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              description: 'SEO keywords',
            },
            related: {
              type: 'array',
              items: { type: 'string' },
              description: 'Related article IDs',
            },
          },
          required: ['name', 'text'],
        },
      },
      {
        name: 'updateDocsArticle',
        description: 'Update an existing Help Scout Docs article. Only provide fields you want to change.',
        inputSchema: {
          type: 'object',
          properties: {
            articleId: {
              type: 'string',
              description: 'The article ID to update',
            },
            name: {
              type: 'string',
              description: 'New article title',
            },
            text: {
              type: 'string',
              description: 'New article content (HTML or plain text)',
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Category IDs (omit to keep existing)',
            },
            status: {
              type: 'string',
              enum: ['published', 'notpublished'],
              description: 'Publish status',
            },
            slug: {
              type: 'string',
              description: 'URL slug',
            },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              description: 'SEO keywords',
            },
            related: {
              type: 'array',
              items: { type: 'string' },
              description: 'Related article IDs',
            },
          },
          required: ['articleId'],
        },
      },
      {
        name: 'deleteDocsArticle',
        description: 'Delete an article from Help Scout Docs. This action is irreversible.',
        inputSchema: {
          type: 'object',
          properties: {
            articleId: {
              type: 'string',
              description: 'The article ID to delete',
            },
          },
          required: ['articleId'],
        },
      },
    ];
  }

  async listDocsCategories(args: unknown): Promise<CallToolResult> {
    const input = ListDocsCategoriesInputSchema.parse(args);
    const collectionId = this.getCollectionId(input.collectionId);

    logger.debug('Listing docs categories', { collectionId });
    const data = await docsClient.get(`/collections/${collectionId}/categories`, {
      sort: input.sort,
      order: input.order,
    });
    return this.toResult(data);
  }

  async listDocsArticles(args: unknown): Promise<CallToolResult> {
    const input = ListDocsArticlesInputSchema.parse(args);

    const params: Record<string, unknown> = {
      status: input.status,
      sort: input.sort,
      order: input.order,
      page: input.page,
      pageSize: input.pageSize,
    };

    let endpoint: string;
    if (input.categoryId) {
      endpoint = `/categories/${input.categoryId}/articles`;
      logger.debug('Listing docs articles by category', { categoryId: input.categoryId });
    } else {
      const collectionId = this.getCollectionId(input.collectionId);
      endpoint = `/collections/${collectionId}/articles`;
      logger.debug('Listing docs articles by collection', { collectionId });
    }

    const data = await docsClient.get(endpoint, params);
    return this.toResult(data);
  }

  async searchDocsArticles(args: unknown): Promise<CallToolResult> {
    const input = SearchDocsArticlesInputSchema.parse(args);

    const params: Record<string, unknown> = {
      query: input.query,
      page: input.page,
      status: input.status,
    };
    if (input.collectionId) params.collectionId = input.collectionId;

    logger.debug('Searching docs articles', { query: input.query });
    const data = await docsClient.get('/search/articles', params);
    return this.toResult(data);
  }

  async getDocsArticle(args: unknown): Promise<CallToolResult> {
    const input = GetDocsArticleInputSchema.parse(args);

    logger.debug('Getting docs article', { articleId: input.articleId });
    const data = await docsClient.get(`/articles/${input.articleId}`);
    return this.toResult(data);
  }

  async createDocsArticle(args: unknown): Promise<CallToolResult> {
    const input = CreateDocsArticleInputSchema.parse(args);
    const collectionId = this.getCollectionId(input.collectionId);

    const body: Record<string, unknown> = {
      collectionId,
      name: input.name,
      text: input.text,
      status: input.status,
      reload: true,
    };
    if (input.categories) body.categories = input.categories;
    if (input.slug) body.slug = input.slug;
    if (input.keywords) body.keywords = input.keywords;
    if (input.related) body.related = input.related;

    logger.debug('Creating docs article', { name: input.name, collectionId });
    const data = await docsClient.post<Record<string, unknown>>('/articles', body);

    // Extract article info from response
    const article = (data as Record<string, unknown>).article || data;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          action: 'article_created',
          article,
          message: `Article "${input.name}" created successfully.`,
        }, null, 2),
      }],
    };
  }

  async updateDocsArticle(args: unknown): Promise<CallToolResult> {
    const input = UpdateDocsArticleInputSchema.parse(args);

    const body: Record<string, unknown> = { reload: true };
    if (input.name !== undefined) body.name = input.name;
    if (input.text !== undefined) body.text = input.text;
    if (input.categories !== undefined) body.categories = input.categories;
    if (input.status !== undefined) body.status = input.status;
    if (input.slug !== undefined) body.slug = input.slug;
    if (input.keywords !== undefined) body.keywords = input.keywords;
    if (input.related !== undefined) body.related = input.related;

    logger.debug('Updating docs article', { articleId: input.articleId });
    const data = await docsClient.put<Record<string, unknown>>(`/articles/${input.articleId}`, body);

    const article = (data as Record<string, unknown>).article || data;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          action: 'article_updated',
          articleId: input.articleId,
          article,
          message: `Article ${input.articleId} updated successfully.`,
        }, null, 2),
      }],
    };
  }

  async deleteDocsArticle(args: unknown): Promise<CallToolResult> {
    const input = DeleteDocsArticleInputSchema.parse(args);

    logger.debug('Deleting docs article', { articleId: input.articleId });
    await docsClient.delete(`/articles/${input.articleId}`);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          action: 'article_deleted',
          articleId: input.articleId,
          message: `Article ${input.articleId} deleted permanently.`,
        }, null, 2),
      }],
    };
  }
}

export const docsToolHandler = new DocsToolHandler();
