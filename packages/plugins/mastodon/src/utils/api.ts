import axios from 'axios';
import FormData from 'form-data';

/**
 * Mastodon API client for making authenticated requests
 */
export class MastodonClient {
  private baseUrl: string;
  private accessToken: string;

  /**
   * Create a new Mastodon API client
   * @param auth Authentication details
   */
  constructor(auth: {
    baseUrl: string;
    accessToken: string;
  }) {
    // Remove trailing slash from baseUrl if present
    this.baseUrl = auth.baseUrl.replace(/\/$/, '');
    this.accessToken = auth.accessToken;
  }

  /**
   * Make a request to the Mastodon API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @param headers Additional headers
   * @returns API response
   */
  async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v1${endpoint}`;
      
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          ...headers
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Mastodon API error: ${error.response.status} - ${
            error.response.data.error || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Mastodon API: ${error.message}`);
      } else {
        throw new Error(`Error making request to Mastodon API: ${error.message}`);
      }
    }
  }

  /**
   * Post a status to Mastodon
   * @param status Status text
   * @param mediaIds Optional array of media IDs to attach
   * @param visibility Optional visibility level (public, unlisted, private, direct)
   * @param sensitive Whether the status contains sensitive content
   * @param spoilerText Optional text to be shown as a spoiler warning
   * @returns Posted status
   */
  async postStatus(
    status: string,
    mediaIds?: string[],
    visibility?: 'public' | 'unlisted' | 'private' | 'direct',
    sensitive?: boolean,
    spoilerText?: string
  ): Promise<any> {
    const data: any = { status };

    if (mediaIds && mediaIds.length > 0) {
      data.media_ids = mediaIds;
    }

    if (visibility) {
      data.visibility = visibility;
    }

    if (sensitive !== undefined) {
      data.sensitive = sensitive;
    }

    if (spoilerText) {
      data.spoiler_text = spoilerText;
    }

    return this.makeRequest('POST', '/statuses', data);
  }

  /**
   * Upload media to Mastodon
   * @param file File buffer
   * @param filename Filename
   * @param description Optional description of the media
   * @returns Media object
   */
  async uploadMedia(
    file: Buffer,
    filename: string,
    description?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file, filename);
    
    if (description) {
      formData.append('description', description);
    }

    // Use v2 media endpoint for uploads
    const url = `${this.baseUrl}/api/v2/media`;
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Mastodon media upload error: ${error.response.status} - ${
            error.response.data.error || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Mastodon API: ${error.message}`);
      } else {
        throw new Error(`Error uploading media to Mastodon: ${error.message}`);
      }
    }
  }

  /**
   * Get the current user's account information
   * @returns Account information
   */
  async verifyCredentials(): Promise<any> {
    return this.makeRequest('GET', '/accounts/verify_credentials');
  }

  /**
   * Get a user's account information by ID
   * @param id Account ID
   * @returns Account information
   */
  async getAccount(id: string): Promise<any> {
    return this.makeRequest('GET', `/accounts/${id}`);
  }

  /**
   * Get a user's statuses
   * @param id Account ID
   * @param limit Maximum number of statuses to get
   * @returns List of statuses
   */
  async getAccountStatuses(id: string, limit?: number): Promise<any> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest('GET', `/accounts/${id}/statuses${params}`);
  }

  /**
   * Get a user's followers
   * @param id Account ID
   * @param limit Maximum number of followers to get
   * @returns List of followers
   */
  async getAccountFollowers(id: string, limit?: number): Promise<any> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest('GET', `/accounts/${id}/followers${params}`);
  }

  /**
   * Get a user's following
   * @param id Account ID
   * @param limit Maximum number of following to get
   * @returns List of following
   */
  async getAccountFollowing(id: string, limit?: number): Promise<any> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest('GET', `/accounts/${id}/following${params}`);
  }

  /**
   * Follow a user
   * @param id Account ID
   * @returns Relationship
   */
  async followAccount(id: string): Promise<any> {
    return this.makeRequest('POST', `/accounts/${id}/follow`);
  }

  /**
   * Unfollow a user
   * @param id Account ID
   * @returns Relationship
   */
  async unfollowAccount(id: string): Promise<any> {
    return this.makeRequest('POST', `/accounts/${id}/unfollow`);
  }

  /**
   * Get a status by ID
   * @param id Status ID
   * @returns Status
   */
  async getStatus(id: string): Promise<any> {
    return this.makeRequest('GET', `/statuses/${id}`);
  }

  /**
   * Delete a status
   * @param id Status ID
   * @returns Empty response
   */
  async deleteStatus(id: string): Promise<any> {
    return this.makeRequest('DELETE', `/statuses/${id}`);
  }

  /**
   * Favorite a status
   * @param id Status ID
   * @returns Status
   */
  async favoriteStatus(id: string): Promise<any> {
    return this.makeRequest('POST', `/statuses/${id}/favourite`);
  }

  /**
   * Unfavorite a status
   * @param id Status ID
   * @returns Status
   */
  async unfavoriteStatus(id: string): Promise<any> {
    return this.makeRequest('POST', `/statuses/${id}/unfavourite`);
  }

  /**
   * Boost a status
   * @param id Status ID
   * @returns Status
   */
  async boostStatus(id: string): Promise<any> {
    return this.makeRequest('POST', `/statuses/${id}/reblog`);
  }

  /**
   * Unboost a status
   * @param id Status ID
   * @returns Status
   */
  async unboostStatus(id: string): Promise<any> {
    return this.makeRequest('POST', `/statuses/${id}/unreblog`);
  }

  /**
   * Get the home timeline
   * @param limit Maximum number of statuses to get
   * @returns List of statuses
   */
  async getHomeTimeline(limit?: number): Promise<any> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest('GET', `/timelines/home${params}`);
  }

  /**
   * Get the public timeline
   * @param local Only show local statuses
   * @param limit Maximum number of statuses to get
   * @returns List of statuses
   */
  async getPublicTimeline(local?: boolean, limit?: number): Promise<any> {
    let params = '';
    if (local || limit) {
      params = '?';
      if (local) {
        params += 'local=true';
      }
      if (limit) {
        params += (local ? '&' : '') + `limit=${limit}`;
      }
    }
    return this.makeRequest('GET', `/timelines/public${params}`);
  }

  /**
   * Make a custom API call to Mastodon
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param data Request data
   * @returns API response
   */
  async makeCustomApiCall(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> {
    // Ensure endpoint starts with a slash
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    return this.makeRequest(method, endpoint, data);
  }
}
