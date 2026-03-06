import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from './logger.js';
import { config } from './config.js';

/**
 * Help Scout Docs API client.
 * Uses HTTP Basic Auth with API key (separate from the Mailbox API OAuth2 flow).
 * API docs: https://developer.helpscout.com/docs-api/
 */
export class DocsClient {
  private client: AxiosInstance;

  constructor() {
    const apiKey = config.docs.apiKey;

    this.client = axios.create({
      baseURL: 'https://docsapi.helpscout.net/v1',
      timeout: 30000,
      auth: apiKey ? { username: apiKey, password: 'X' } : undefined,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data as Record<string, unknown> | undefined;
        logger.error('Docs API error', {
          status,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          message: data?.message || error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  isConfigured(): boolean {
    return !!config.docs.apiKey;
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  async delete(endpoint: string): Promise<void> {
    await this.client.delete(endpoint);
  }
}

export const docsClient = new DocsClient();
