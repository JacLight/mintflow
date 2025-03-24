import { ApolloClient } from './client.js';

export interface ApolloAuth {
    apiKey: string;
}

export function makeClient(auth: ApolloAuth): ApolloClient {
    return new ApolloClient(auth.apiKey);
}

export * from './client.js';
