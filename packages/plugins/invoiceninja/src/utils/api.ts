import axios from 'axios';

/**
 * InvoiceNinja API client for making authenticated requests
 */
export class InvoiceNinjaClient {
  private client: any;
  private baseUrl: string;
  private apiToken: string;

  /**
   * Create a new InvoiceNinja API client
   * @param auth Authentication details
   */
  constructor(auth: {
    apiToken: string;
    baseUrl: string;
  }) {
    this.apiToken = auth.apiToken;
    this.baseUrl = auth.baseUrl.endsWith('/') ? auth.baseUrl : `${auth.baseUrl}/`;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-API-TOKEN': this.apiToken,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  }

  /**
   * Make a request to the InvoiceNinja API
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
          `InvoiceNinja API error: ${error.response.status} - ${
            error.response.data.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from InvoiceNinja API: ${error.message}`);
      } else {
        throw new Error(`Error making request to InvoiceNinja API: ${error.message}`);
      }
    }
  }

  /**
   * Get clients from InvoiceNinja
   * @param params Query parameters
   * @returns List of clients
   */
  async getClients(params?: any): Promise<any> {
    return this.makeRequest('GET', 'api/v1/clients', undefined, { params });
  }

  /**
   * Get a single client by ID
   * @param clientId Client ID
   * @returns Client details
   */
  async getClient(clientId: string): Promise<any> {
    return this.makeRequest('GET', `api/v1/clients/${clientId}`);
  }

  /**
   * Create a client in InvoiceNinja
   * @param client Client data
   * @returns Created client
   */
  async createClient(client: any): Promise<any> {
    return this.makeRequest('POST', 'api/v1/clients', client);
  }

  /**
   * Update a client in InvoiceNinja
   * @param clientId Client ID
   * @param client Client data
   * @returns Updated client
   */
  async updateClient(clientId: string, client: any): Promise<any> {
    return this.makeRequest('PUT', `api/v1/clients/${clientId}`, client);
  }

  /**
   * Get invoices from InvoiceNinja
   * @param params Query parameters
   * @returns List of invoices
   */
  async getInvoices(params?: any): Promise<any> {
    return this.makeRequest('GET', 'api/v1/invoices', undefined, { params });
  }

  /**
   * Get a single invoice by ID
   * @param invoiceId Invoice ID
   * @returns Invoice details
   */
  async getInvoice(invoiceId: string): Promise<any> {
    return this.makeRequest('GET', `api/v1/invoices/${invoiceId}`);
  }

  /**
   * Create an invoice in InvoiceNinja
   * @param invoice Invoice data
   * @returns Created invoice
   */
  async createInvoice(invoice: any): Promise<any> {
    return this.makeRequest('POST', 'api/v1/invoices', invoice);
  }

  /**
   * Update an invoice in InvoiceNinja
   * @param invoiceId Invoice ID
   * @param invoice Invoice data
   * @returns Updated invoice
   */
  async updateInvoice(invoiceId: string, invoice: any): Promise<any> {
    return this.makeRequest('PUT', `api/v1/invoices/${invoiceId}`, invoice);
  }

  /**
   * Get products from InvoiceNinja
   * @param params Query parameters
   * @returns List of products
   */
  async getProducts(params?: any): Promise<any> {
    return this.makeRequest('GET', 'api/v1/products', undefined, { params });
  }

  /**
   * Get a single product by ID
   * @param productId Product ID
   * @returns Product details
   */
  async getProduct(productId: string): Promise<any> {
    return this.makeRequest('GET', `api/v1/products/${productId}`);
  }

  /**
   * Create a product in InvoiceNinja
   * @param product Product data
   * @returns Created product
   */
  async createProduct(product: any): Promise<any> {
    return this.makeRequest('POST', 'api/v1/products', product);
  }

  /**
   * Get payments from InvoiceNinja
   * @param params Query parameters
   * @returns List of payments
   */
  async getPayments(params?: any): Promise<any> {
    return this.makeRequest('GET', 'api/v1/payments', undefined, { params });
  }

  /**
   * Get a single payment by ID
   * @param paymentId Payment ID
   * @returns Payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    return this.makeRequest('GET', `api/v1/payments/${paymentId}`);
  }

  /**
   * Create a payment in InvoiceNinja
   * @param payment Payment data
   * @returns Created payment
   */
  async createPayment(payment: any): Promise<any> {
    return this.makeRequest('POST', 'api/v1/payments', payment);
  }

  /**
   * Make a custom API call to InvoiceNinja
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
