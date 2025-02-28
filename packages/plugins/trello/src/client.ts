import axios, { AxiosInstance } from 'axios';
import {
    TrelloAuth,
    TrelloBoard,
    TrelloCard,
    TrelloList,
    TrelloLabel,
    TrelloWebhook,
    TrelloMember
} from './models.js';

export class TrelloClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string = 'https://api.trello.com/1/';
    private auth: TrelloAuth;

    constructor(auth: TrelloAuth, axiosInstance?: AxiosInstance) {
        this.auth = auth;
        this.axiosInstance = axiosInstance || axios;
    }

    /**
     * Get the authenticated user
     */
    async getAuthorizedUser(): Promise<TrelloMember> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/members/me'
        });
        return response.data;
    }

    /**
     * Validate authentication credentials
     */
    async validateAuth(): Promise<boolean> {
        try {
            await this.getAuthorizedUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get boards for the authenticated user
     */
    async getBoards(userId?: string): Promise<TrelloBoard[]> {
        const id = userId || 'me';
        const response = await this.sendRequest({
            method: 'get',
            url: `/members/${id}/boards`
        });
        return response.data;
    }

    /**
     * Get a specific board by ID
     */
    async getBoard(boardId: string): Promise<TrelloBoard> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/boards/${boardId}`
        });
        return response.data;
    }

    /**
     * Get lists in a board
     */
    async getBoardLists(boardId: string): Promise<TrelloList[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/boards/${boardId}/lists`
        });
        return response.data;
    }

    /**
     * Get labels in a board
     */
    async getBoardLabels(boardId: string): Promise<TrelloLabel[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/boards/${boardId}/labels`
        });
        return response.data;
    }

    /**
     * Get cards in a board
     */
    async getBoardCards(boardId: string): Promise<TrelloCard[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/boards/${boardId}/cards`
        });
        return response.data;
    }

    /**
     * Get cards in a list
     */
    async getListCards(listId: string): Promise<TrelloCard[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/lists/${listId}/cards`
        });
        return response.data;
    }

    /**
     * Get a specific card by ID
     */
    async getCard(cardId: string): Promise<TrelloCard> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/cards/${cardId}`
        });
        return response.data;
    }

    /**
     * Create a new card
     */
    async createCard(card: {
        idList: string;
        name: string;
        desc?: string;
        pos?: 'top' | 'bottom' | number;
        due?: string;
        dueComplete?: boolean;
        idMembers?: string[];
        idLabels?: string[];
        urlSource?: string;
        fileSource?: string;
        idCardSource?: string;
        keepFromSource?: string;
    }): Promise<TrelloCard> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/cards',
            data: card
        });
        return response.data;
    }

    /**
     * Update an existing card
     */
    async updateCard(cardId: string, card: {
        name?: string;
        desc?: string;
        closed?: boolean;
        idMembers?: string[];
        idLabels?: string[];
        idList?: string;
        pos?: 'top' | 'bottom' | number;
        due?: string;
        dueComplete?: boolean;
    }): Promise<TrelloCard> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/cards/${cardId}`,
            data: card
        });
        return response.data;
    }

    /**
     * Delete a card
     */
    async deleteCard(cardId: string): Promise<void> {
        await this.sendRequest({
            method: 'delete',
            url: `/cards/${cardId}`
        });
    }

    /**
     * Add a comment to a card
     */
    async addCommentToCard(cardId: string, text: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/cards/${cardId}/actions/comments`,
            data: { text }
        });
        return response.data;
    }

    /**
     * Add a label to a card
     */
    async addLabelToCard(cardId: string, labelId: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/cards/${cardId}/idLabels`,
            data: { value: labelId }
        });
        return response.data;
    }

    /**
     * Remove a label from a card
     */
    async removeLabelFromCard(cardId: string, labelId: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'delete',
            url: `/cards/${cardId}/idLabels/${labelId}`
        });
        return response.data;
    }

    /**
     * Create a new list
     */
    async createList(list: {
        name: string;
        idBoard: string;
        pos?: 'top' | 'bottom' | number;
    }): Promise<TrelloList> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/lists',
            data: list
        });
        return response.data;
    }

    /**
     * Update an existing list
     */
    async updateList(listId: string, list: {
        name?: string;
        closed?: boolean;
        pos?: 'top' | 'bottom' | number;
        idBoard?: string;
    }): Promise<TrelloList> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/lists/${listId}`,
            data: list
        });
        return response.data;
    }

    /**
     * Create a webhook
     */
    async createWebhook(idModel: string, callbackURL: string, description?: string): Promise<TrelloWebhook> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/webhooks',
            data: {
                idModel,
                callbackURL,
                description: description || `Webhook for ${idModel}`
            }
        });
        return response.data;
    }

    /**
     * Delete a webhook
     */
    async deleteWebhook(webhookId: string): Promise<void> {
        await this.sendRequest({
            method: 'delete',
            url: `/webhooks/${webhookId}`
        });
    }

    /**
     * List all webhooks
     */
    async listWebhooks(): Promise<TrelloWebhook[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/tokens/${this.auth.token}/webhooks`
        });
        return response.data;
    }

    /**
     * Send a request to the Trello API
     */
    private async sendRequest(config: any): Promise<any> {
        // Add authentication parameters to URL
        const separator = config.url.includes('?') ? '&' : '?';
        const authParams = `key=${this.auth.apiKey}&token=${this.auth.token}`;
        const url = `${this.baseUrl}${config.url.substring(1)}${separator}${authParams}`;

        return this.axiosInstance({
            ...config,
            url,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...config.headers
            }
        });
    }
}
