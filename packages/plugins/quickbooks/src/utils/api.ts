import axios from 'axios';
import IntuitOAuth from 'intuit-oauth';

/**
 * QuickBooks API client for making authenticated requests
 */
export class QuickBooksClient {
  private accessToken: string;
  private baseUrl: string;
  private oauthClient: any;

  /**
   * Create a new QuickBooks API client
   * @param auth Authentication details
   */
  constructor(auth: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    realmId: string;
    environment: string;
  }) {
    this.accessToken = '';
    this.baseUrl = auth.environment === 'sandbox'
      ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
      : 'https://quickbooks.api.intuit.com/v3/company';

    this.oauthClient = new IntuitOAuth({
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
      environment: auth.environment === 'sandbox' ? 'sandbox' : 'production',
      redirectUri: 'https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl',
    });
  }

  /**
   * Refresh the access token using the refresh token
   * @param refreshToken Refresh token
   * @returns New access token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      this.oauthClient.setToken({
        refresh_token: refreshToken,
      });

      const authResponse = await this.oauthClient.refreshUsingToken(refreshToken);
      this.accessToken = authResponse.token.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Make a request to the QuickBooks API
   * @param auth Authentication details
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @returns API response
   */
  async makeRequest(
    auth: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      realmId: string;
      environment: string;
    },
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<any> {
    try {
      // Refresh the access token if it's not set
      if (!this.accessToken) {
        await this.refreshAccessToken(auth.refreshToken);
      }

      // Make the API request
      const response = await axios({
        method,
        url: `${this.baseUrl}/${auth.realmId}/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data,
        params,
      });

      return response.data;
    } catch (error: any) {
      // Handle 401 Unauthorized errors by refreshing the token and retrying
      if (error.response && error.response.status === 401) {
        try {
          await this.refreshAccessToken(auth.refreshToken);
          
          // Retry the request with the new token
          const response = await axios({
            method,
            url: `${this.baseUrl}/${auth.realmId}/${endpoint}`,
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            data,
            params,
          });

          return response.data;
        } catch (refreshError) {
          console.error('Error refreshing token and retrying request:', refreshError);
          throw new Error('Authentication failed. Please check your credentials.');
        }
      }

      // Handle other errors
      if (error.response) {
        const errorMessage = error.response.data?.Fault?.Error?.[0]?.Message || error.response.data?.Fault?.Error?.Message || error.message;
        throw new Error(`QuickBooks API error: ${errorMessage}`);
      }

      throw new Error(`Failed to make request to QuickBooks: ${error.message}`);
    }
  }

  /**
   * Query the QuickBooks API using the Query endpoint
   * @param auth Authentication details
   * @param entity Entity to query (e.g., 'Customer', 'Invoice')
   * @param query Query string
   * @returns Query results
   */
  async query(
    auth: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      realmId: string;
      environment: string;
    },
    entity: string,
    conditions?: string
  ): Promise<any> {
    const queryString = conditions 
      ? `SELECT * FROM ${entity} WHERE ${conditions}`
      : `SELECT * FROM ${entity}`;
    
    return this.makeRequest(
      auth,
      'GET',
      'query',
      undefined,
      { query: queryString }
    );
  }
}
