import * as XeroNode from 'xero-node';

/**
 * Xero API client for making authenticated requests
 */
export class XeroApiClient {
  private client: any;
  private tenantId: string;

  /**
   * Create a new Xero API client
   * @param auth Authentication details
   */
  constructor(auth: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    tenantId: string;
  }) {
    this.client = new XeroNode.XeroClient({
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
      redirectUris: ['https://example.com/callback'], // Not used for token refresh
      scopes: ['accounting.transactions', 'accounting.contacts', 'accounting.settings'],
    });
    this.tenantId = auth.tenantId;
  }

  /**
   * Initialize the client with a refresh token
   * @param refreshToken Refresh token
   */
  async initialize(refreshToken: string): Promise<void> {
    try {
      await this.client.setTokenSet({
        refresh_token: refreshToken,
        id_token: '',
        access_token: '',
        expires_in: -1,
        token_type: 'Bearer',
        scope: 'accounting.transactions accounting.contacts accounting.settings',
      });

      // Refresh the token
      await this.client.refreshToken();
    } catch (error) {
      console.error('Error initializing Xero client:', error);
      throw new Error('Failed to initialize Xero client');
    }
  }

  /**
   * Get contacts from Xero
   * @param where Optional filter criteria
   * @returns List of contacts
   */
  async getContacts(where?: string): Promise<any> {
    try {
      const response = await this.client.accountingApi.getContacts(
        this.tenantId,
        undefined,
        where,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
      return response.body;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw new Error('Failed to get contacts from Xero');
    }
  }

  /**
   * Get a single contact by ID
   * @param contactId Contact ID
   * @returns Contact details
   */
  async getContact(contactId: string): Promise<any> {
    try {
      const response = await this.client.accountingApi.getContact(
        this.tenantId,
        contactId
      );
      return response.body;
    } catch (error) {
      console.error('Error getting contact:', error);
      throw new Error('Failed to get contact from Xero');
    }
  }

  /**
   * Create a contact in Xero
   * @param contact Contact data
   * @returns Created contact
   */
  async createContact(contact: any): Promise<any> {
    try {
      const response = await this.client.accountingApi.createContacts(
        this.tenantId,
        { contacts: [contact] }
      );
      return response.body;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact in Xero');
    }
  }

  /**
   * Get invoices from Xero
   * @param where Optional filter criteria
   * @returns List of invoices
   */
  async getInvoices(where?: string): Promise<any> {
    try {
      const response = await this.client.accountingApi.getInvoices(
        this.tenantId,
        undefined,
        where,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
      return response.body;
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw new Error('Failed to get invoices from Xero');
    }
  }

  /**
   * Get a single invoice by ID
   * @param invoiceId Invoice ID
   * @returns Invoice details
   */
  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await this.client.accountingApi.getInvoice(
        this.tenantId,
        invoiceId
      );
      return response.body;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw new Error('Failed to get invoice from Xero');
    }
  }

  /**
   * Create an invoice in Xero
   * @param invoice Invoice data
   * @returns Created invoice
   */
  async createInvoice(invoice: any): Promise<any> {
    try {
      const response = await this.client.accountingApi.createInvoices(
        this.tenantId,
        { invoices: [invoice] }
      );
      return response.body;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice in Xero');
    }
  }

  /**
   * Get accounts from Xero
   * @param where Optional filter criteria
   * @returns List of accounts
   */
  async getAccounts(where?: string): Promise<any> {
    try {
      const response = await this.client.accountingApi.getAccounts(
        this.tenantId,
        undefined,
        where
      );
      return response.body;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw new Error('Failed to get accounts from Xero');
    }
  }

  /**
   * Get a report from Xero
   * @param reportId Report ID
   * @param params Report parameters
   * @returns Report data
   */
  async getReport(reportId: string, params?: any): Promise<any> {
    try {
      const response = await this.client.accountingApi.getReportProfitAndLoss(
        this.tenantId,
        params?.fromDate,
        params?.toDate,
        params?.periods,
        params?.timeframe,
        params?.trackingCategoryID,
        params?.trackingCategoryID2,
        params?.trackingOptionID,
        params?.trackingOptionID2,
        params?.standardLayout,
        params?.paymentsOnly
      );
      return response.body;
    } catch (error) {
      console.error('Error getting report:', error);
      throw new Error('Failed to get report from Xero');
    }
  }

  /**
   * Make a custom API call to Xero
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param data Request data
   * @returns API response
   */
  async makeCustomApiCall(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      // Use the appropriate API based on the endpoint
      const api = this.client.accountingApi;
      
      // Call the method dynamically
      if (typeof api[endpoint] === 'function') {
        const response = await api[endpoint](this.tenantId, data);
        return response.body;
      } else {
        throw new Error(`Endpoint ${endpoint} not found`);
      }
    } catch (error) {
      console.error('Error making custom API call:', error);
      throw new Error('Failed to make custom API call to Xero');
    }
  }
}
