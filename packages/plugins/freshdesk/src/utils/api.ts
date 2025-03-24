import axios from 'axios';
import FormData from 'form-data';

/**
 * Freshdesk API client for making authenticated requests
 */
export class FreshdeskClient {
  private client: any;
  private baseUrl: string;
  private apiKey: string;

  /**
   * Create a new Freshdesk API client
   * @param auth Authentication details
   */
  constructor(auth: {
    apiKey: string;
    domain: string;
  }) {
    this.apiKey = auth.apiKey;
    this.baseUrl = `https://${auth.domain}.freshdesk.com/api/v2`;

    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.apiKey,
        password: 'X', // Freshdesk API uses the API key as the username and 'X' as the password
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a request to the Freshdesk API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @param config Additional request configuration
   * @returns API response
   */
  async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    config?: any
  ): Promise<any> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
        ...config,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Freshdesk API error: ${error.response.status} - ${
            error.response.data.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Freshdesk API: ${error.message}`);
      } else {
        throw new Error(`Error making request to Freshdesk API: ${error.message}`);
      }
    }
  }

  /**
   * Get tickets from Freshdesk
   * @param params Query parameters
   * @returns List of tickets
   */
  async getTickets(params?: any): Promise<any> {
    return this.makeRequest('GET', '/tickets', undefined, { params });
  }

  /**
   * Get a single ticket by ID
   * @param ticketId Ticket ID
   * @returns Ticket details
   */
  async getTicket(ticketId: number): Promise<any> {
    return this.makeRequest('GET', `/tickets/${ticketId}`);
  }

  /**
   * Create a ticket in Freshdesk
   * @param ticket Ticket data
   * @returns Created ticket
   */
  async createTicket(ticket: any): Promise<any> {
    return this.makeRequest('POST', '/tickets', ticket);
  }

  /**
   * Update a ticket in Freshdesk
   * @param ticketId Ticket ID
   * @param ticket Ticket data
   * @returns Updated ticket
   */
  async updateTicket(ticketId: number, ticket: any): Promise<any> {
    return this.makeRequest('PUT', `/tickets/${ticketId}`, ticket);
  }

  /**
   * Delete a ticket in Freshdesk
   * @param ticketId Ticket ID
   * @returns Void
   */
  async deleteTicket(ticketId: number): Promise<any> {
    return this.makeRequest('DELETE', `/tickets/${ticketId}`);
  }

  /**
   * Get contacts from Freshdesk
   * @param params Query parameters
   * @returns List of contacts
   */
  async getContacts(params?: any): Promise<any> {
    return this.makeRequest('GET', '/contacts', undefined, { params });
  }

  /**
   * Get a single contact by ID
   * @param contactId Contact ID
   * @returns Contact details
   */
  async getContact(contactId: number): Promise<any> {
    return this.makeRequest('GET', `/contacts/${contactId}`);
  }

  /**
   * Create a contact in Freshdesk
   * @param contact Contact data
   * @returns Created contact
   */
  async createContact(contact: any): Promise<any> {
    return this.makeRequest('POST', '/contacts', contact);
  }

  /**
   * Update a contact in Freshdesk
   * @param contactId Contact ID
   * @param contact Contact data
   * @returns Updated contact
   */
  async updateContact(contactId: number, contact: any): Promise<any> {
    return this.makeRequest('PUT', `/contacts/${contactId}`, contact);
  }

  /**
   * Delete a contact in Freshdesk
   * @param contactId Contact ID
   * @returns Void
   */
  async deleteContact(contactId: number): Promise<any> {
    return this.makeRequest('DELETE', `/contacts/${contactId}`);
  }

  /**
   * Get agents from Freshdesk
   * @param params Query parameters
   * @returns List of agents
   */
  async getAgents(params?: any): Promise<any> {
    return this.makeRequest('GET', '/agents', undefined, { params });
  }

  /**
   * Get a single agent by ID
   * @param agentId Agent ID
   * @returns Agent details
   */
  async getAgent(agentId: number): Promise<any> {
    return this.makeRequest('GET', `/agents/${agentId}`);
  }

  /**
   * Get companies from Freshdesk
   * @param params Query parameters
   * @returns List of companies
   */
  async getCompanies(params?: any): Promise<any> {
    return this.makeRequest('GET', '/companies', undefined, { params });
  }

  /**
   * Get a single company by ID
   * @param companyId Company ID
   * @returns Company details
   */
  async getCompany(companyId: number): Promise<any> {
    return this.makeRequest('GET', `/companies/${companyId}`);
  }

  /**
   * Create a company in Freshdesk
   * @param company Company data
   * @returns Created company
   */
  async createCompany(company: any): Promise<any> {
    return this.makeRequest('POST', '/companies', company);
  }

  /**
   * Update a company in Freshdesk
   * @param companyId Company ID
   * @param company Company data
   * @returns Updated company
   */
  async updateCompany(companyId: number, company: any): Promise<any> {
    return this.makeRequest('PUT', `/companies/${companyId}`, company);
  }

  /**
   * Delete a company in Freshdesk
   * @param companyId Company ID
   * @returns Void
   */
  async deleteCompany(companyId: number): Promise<any> {
    return this.makeRequest('DELETE', `/companies/${companyId}`);
  }

  /**
   * Get groups from Freshdesk
   * @param params Query parameters
   * @returns List of groups
   */
  async getGroups(params?: any): Promise<any> {
    return this.makeRequest('GET', '/groups', undefined, { params });
  }

  /**
   * Get a single group by ID
   * @param groupId Group ID
   * @returns Group details
   */
  async getGroup(groupId: number): Promise<any> {
    return this.makeRequest('GET', `/groups/${groupId}`);
  }

  /**
   * Create a ticket reply in Freshdesk
   * @param ticketId Ticket ID
   * @param reply Reply data
   * @returns Created reply
   */
  async createTicketReply(ticketId: number, reply: any): Promise<any> {
    return this.makeRequest('POST', `/tickets/${ticketId}/reply`, reply);
  }

  /**
   * Create a ticket note in Freshdesk
   * @param ticketId Ticket ID
   * @param note Note data
   * @returns Created note
   */
  async createTicketNote(ticketId: number, note: any): Promise<any> {
    return this.makeRequest('POST', `/tickets/${ticketId}/notes`, note);
  }

  /**
   * Upload an attachment to Freshdesk
   * @param file File data
   * @returns Attachment details
   */
  async uploadAttachment(file: Buffer, fileName: string): Promise<any> {
    const formData = new FormData();
    formData.append('attachments[]', file, fileName);

    const config = {
      headers: {
        ...this.client.defaults.headers,
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
    };

    return this.makeRequest('POST', '/upload_attachments', formData, config);
  }

  /**
   * Get ticket fields from Freshdesk
   * @returns List of ticket fields
   */
  async getTicketFields(): Promise<any> {
    return this.makeRequest('GET', '/ticket_fields');
  }

  /**
   * Get ticket satisfaction ratings from Freshdesk
   * @param ticketId Ticket ID
   * @returns Satisfaction ratings
   */
  async getTicketSatisfactionRatings(ticketId: number): Promise<any> {
    return this.makeRequest('GET', `/tickets/${ticketId}/satisfaction_ratings`);
  }

  /**
   * Get time entries for a ticket from Freshdesk
   * @param ticketId Ticket ID
   * @returns Time entries
   */
  async getTicketTimeEntries(ticketId: number): Promise<any> {
    return this.makeRequest('GET', `/tickets/${ticketId}/time_entries`);
  }

  /**
   * Create a time entry for a ticket in Freshdesk
   * @param ticketId Ticket ID
   * @param timeEntry Time entry data
   * @returns Created time entry
   */
  async createTicketTimeEntry(ticketId: number, timeEntry: any): Promise<any> {
    return this.makeRequest('POST', `/tickets/${ticketId}/time_entries`, timeEntry);
  }

  /**
   * Make a custom API call to Freshdesk
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param data Request data
   * @param params Query parameters
   * @returns API response
   */
  async makeCustomApiCall(
    endpoint: string,
    method: string,
    data?: any,
    params?: any
  ): Promise<any> {
    return this.makeRequest(method, endpoint, data, { params });
  }
}
