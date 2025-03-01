import axios from 'axios';
import { z } from 'zod';

/**
 * Cal.com API client for making authenticated requests
 */
export class CalComClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.cal.com/v1';

  /**
   * Create a new Cal.com API client
   * @param auth Authentication details
   */
  constructor(auth: { apiKey: string }) {
    this.apiKey = auth.apiKey;
  }

  /**
   * Make a request to the Cal.com API
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
        params: {
          apiKey: this.apiKey
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Cal.com API error: ${error.response.status} - ${
            error.response.data.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Cal.com API: ${error.message}`);
      } else {
        throw new Error(`Error making request to Cal.com API: ${error.message}`);
      }
    }
  }

  /**
   * Create a webhook subscription
   * @param eventTriggers Array of event triggers to subscribe to
   * @param subscriberUrl URL to receive webhook events
   * @returns Webhook information
   */
  async createWebhook(eventTriggers: string[], subscriberUrl: string): Promise<any> {
    return this.makeRequest('POST', '/webhooks', {
      eventTriggers,
      subscriberUrl,
      active: true
    });
  }

  /**
   * Delete a webhook subscription
   * @param webhookId ID of the webhook to delete
   * @returns Deletion result
   */
  async deleteWebhook(webhookId: string): Promise<any> {
    return this.makeRequest('DELETE', `/webhooks/${webhookId}`);
  }

  /**
   * Get available event types
   * @returns List of event types
   */
  async getEventTypes(): Promise<any> {
    return this.makeRequest('GET', '/event-types');
  }

  /**
   * Get a specific event type
   * @param eventTypeId ID of the event type
   * @returns Event type details
   */
  async getEventType(eventTypeId: string): Promise<any> {
    return this.makeRequest('GET', `/event-types/${eventTypeId}`);
  }

  /**
   * Get bookings
   * @param params Optional query parameters
   * @returns List of bookings
   */
  async getBookings(params?: { limit?: number; after?: string; before?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.after) queryParams.append('after', params.after);
    if (params?.before) queryParams.append('before', params.before);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.makeRequest('GET', `/bookings${queryString}`);
  }

  /**
   * Get a specific booking
   * @param bookingId ID of the booking
   * @returns Booking details
   */
  async getBooking(bookingId: string): Promise<any> {
    return this.makeRequest('GET', `/bookings/${bookingId}`);
  }

  /**
   * Make a custom API call to Cal.com
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @returns API response
   */
  async makeCustomApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(method, endpoint, data);
  }
}
