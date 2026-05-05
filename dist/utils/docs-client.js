import axios from 'axios';
import { logger } from './logger.js';
import { config } from './config.js';
/**
 * Help Scout Docs API client.
 * Uses HTTP Basic Auth with API key (separate from the Mailbox API OAuth2 flow).
 * API docs: https://developer.helpscout.com/docs-api/
 */
export class DocsClient {
    constructor() {
        const apiKey = config.docs.apiKey;
        this.client = axios.create({
            baseURL: 'https://docsapi.helpscout.net/v1',
            timeout: 30000,
            auth: apiKey ? { username: apiKey, password: 'X' } : undefined,
            headers: { 'Content-Type': 'application/json' },
        });
        this.client.interceptors.response.use((response) => response, (error) => {
            const status = error.response?.status;
            const data = error.response?.data;
            logger.error('Docs API error', {
                status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: data?.message || error.message,
            });
            return Promise.reject(error);
        });
    }
    isConfigured() {
        return !!config.docs.apiKey;
    }
    async get(endpoint, params) {
        const response = await this.client.get(endpoint, { params });
        return response.data;
    }
    async post(endpoint, data) {
        const response = await this.client.post(endpoint, data);
        return response.data;
    }
    async put(endpoint, data) {
        const response = await this.client.put(endpoint, data);
        return response.data;
    }
    async delete(endpoint) {
        await this.client.delete(endpoint);
    }
}
export const docsClient = new DocsClient();
//# sourceMappingURL=docs-client.js.map