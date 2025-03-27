import mondaySdk from 'monday-sdk-js';
// Define our own interface for MondayClientSdk to avoid type issues
interface MondayClientSdk {
  setToken: (token: string) => void;
  setApiVersion: (version: string) => void;
  api: <T>(query: string, options?: { variables?: any }) => Promise<{ data: T }>;
}
import { Board, MondayColumn, User } from './models.js';
import { mondayGraphQLMutations } from './mutations.js';
import { mondayGraphQLQueries } from './queries.js';

export class MondayClient {
    private client: MondayClientSdk;

    constructor(apiKey: string) {
        // Use any to bypass the type checking for mondaySdk
        this.client = (mondaySdk as any)();
        this.client.setToken(apiKey);
        this.client.setApiVersion('2023-10');
    }

    async listWorkspaces() {
        return await this.client.api<{
            workspaces: { id: string; name: string }[];
        }>(mondayGraphQLQueries.listWorkspaces);
    }

    async listWorkspaceBoards(variables: object) {
        return await this.client.api<{
            boards: { id: string; name: string; type: string }[];
        }>(mondayGraphQLQueries.listWorkspaceBoards, { variables: variables });
    }

    async listBoardGroups(variables: object) {
        return await this.client.api<{ boards: Board[] }>(
            mondayGraphQLQueries.listBoardGroups,
            { variables: variables }
        );
    }

    async listBoardColumns(variables: object) {
        return await this.client.api<{ boards: { columns: MondayColumn[] }[] }>(
            mondayGraphQLQueries.listBoardColumns,
            { variables: variables }
        );
    }

    async listBoardItems(variables: object) {
        return await this.client.api<{ boards: Board[] }>(
            mondayGraphQLQueries.listBoardItems,
            { variables: variables }
        );
    }

    async createItem(variables: object) {
        return await this.client.api(mondayGraphQLMutations.createItem, {
            variables: variables,
        });
    }

    async updateItem(variables: object) {
        return await this.client.api(mondayGraphQLMutations.updateItem, {
            variables: variables,
        });
    }

    async updateItemName(variables: object) {
        return await this.client.api(mondayGraphQLMutations.updateItemName, {
            variables: variables,
        });
    }

    async createWebhook(variables: object) {
        return await this.client.api<{ id: string; board_id: string }>(
            mondayGraphQLMutations.createWebhook,
            {
                variables: variables,
            }
        );
    }

    async deleteWebhook(variables: object) {
        return await this.client.api(mondayGraphQLMutations.deleteWebhook, {
            variables: variables,
        });
    }

    async listUsers() {
        return await this.client.api<{ users: User[] }>(
            mondayGraphQLQueries.listUsers
        );
    }

    async getBoardItemValues(variables: object) {
        return await this.client.api<{ boards: Board[] }>(
            mondayGraphQLQueries.getBoardItemValues,
            { variables: variables }
        );
    }

    async getItemColumnValues(variables: object) {
        return await this.client.api<{ boards: Board[] }>(
            mondayGraphQLQueries.getItemColumnValues,
            {
                variables: variables,
            }
        );
    }

    async createColumn(variables: object) {
        return await this.client.api<{ id: string }>(
            mondayGraphQLMutations.createColumn,
            { variables: variables }
        );
    }

    async createGroup(variables: object) {
        return await this.client.api<{ id: string }>(
            mondayGraphQLMutations.createGroup,
            { variables: variables }
        );
    }

    async createUpdate(variables: object) {
        return await this.client.api<{ id: string }>(
            mondayGraphQLMutations.createUpdate,
            { variables: variables }
        );
    }

    async uploadFileToColumn(variables: object) {
        return await this.client.api<{ id: string; name: string }>(
            mondayGraphQLMutations.uploadFileToColumn,
            { variables: variables }
        );
    }
}

export function createMondayClient(apiKey: string): MondayClient {
    return new MondayClient(apiKey);
}
