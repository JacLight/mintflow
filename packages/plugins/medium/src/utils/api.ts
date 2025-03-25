import axios from 'axios';
import FormData from 'form-data';

/**
 * Medium API client for making authenticated requests
 */
export class MediumClient {
  private integrationToken: string;
  private baseUrl: string = 'https://api.medium.com/v1';

  /**
   * Create a new Medium API client
   * @param auth Authentication details
   */
  constructor(auth: { integrationToken: string }) {
    this.integrationToken = auth.integrationToken;
  }

  /**
   * Make a request to the Medium API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @returns API response
   */
  async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    try {
      const url = endpoint.startsWith('https://') 
        ? endpoint 
        : `${this.baseUrl}${endpoint}`;
      
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Authorization': `Bearer ${this.integrationToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Medium API error: ${error.response.status} - ${
            error.response.data.errors?.[0]?.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Medium API: ${error.message}`);
      } else {
        throw new Error(`Error making request to Medium API: ${error.message}`);
      }
    }
  }

  /**
   * Get information about the authenticated user
   * @returns User information
   */
  async getMe(): Promise<any> {
    return this.makeRequest('GET', '/me');
  }

  /**
   * Get publications for the authenticated user
   * @param userId User ID
   * @returns List of publications
   */
  async getPublications(userId: string): Promise<any> {
    return this.makeRequest('GET', `/users/${userId}/publications`);
  }

  /**
   * Create a post on Medium
   * @param userId User ID
   * @param post Post data
   * @returns Created post
   */
  async createPost(userId: string, post: {
    title: string;
    contentFormat: 'html' | 'markdown';
    content: string;
    tags?: string[];
    canonicalUrl?: string;
    publishStatus?: 'public' | 'draft' | 'unlisted';
    license?: string;
    notifyFollowers?: boolean;
    publicationId?: string;
  }): Promise<any> {
    const endpoint = post.publicationId 
      ? `/publications/${post.publicationId}/posts` 
      : `/users/${userId}/posts`;
    
    return this.makeRequest('POST', endpoint, post);
  }

  /**
   * Upload an image to Medium
   * @param image Image data (base64 encoded)
   * @param contentType Image content type (e.g., 'image/jpeg', 'image/png')
   * @returns Uploaded image URL
   */
  async uploadImage(image: string, contentType: string): Promise<any> {
    const formData = new FormData();
    formData.append('image', Buffer.from(image, 'base64'), {
      contentType,
      filename: `image.${contentType.split('/')[1]}`,
    });

    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/images`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${this.integrationToken}`,
          ...formData.getHeaders(),
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Medium API error: ${error.response.status} - ${
            error.response.data.errors?.[0]?.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Medium API: ${error.message}`);
      } else {
        throw new Error(`Error uploading image to Medium API: ${error.message}`);
      }
    }
  }

  /**
   * Make a custom API call to Medium
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @returns API response
   */
  async makeCustomApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(method, endpoint, data);
  }
}
