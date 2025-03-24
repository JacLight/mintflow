import axios from 'axios';

/**
 * Freshbooks API client for making authenticated requests
 */
export class FreshbooksClient {
  private client: any;
  private baseUrl: string;
  private apiToken: string;
  private accountId: string;

  /**
   * Create a new Freshbooks API client
   * @param auth Authentication details
   */
  constructor(auth: {
    apiToken: string;
    accountId: string;
  }) {
    this.apiToken = auth.apiToken;
    this.accountId = auth.accountId;
    this.baseUrl = 'https://api.freshbooks.com';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Api-Version': 'alpha',
      },
    });
  }

  /**
   * Make a request to the Freshbooks API
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
      // Replace :account_id placeholder with the actual account ID
      const formattedEndpoint = endpoint.replace(':account_id', this.accountId);

      const response = await this.client.request({
        method,
        url: formattedEndpoint,
        data,
        ...config,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Freshbooks API error: ${error.response.status} - ${
            error.response.data.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Freshbooks API: ${error.message}`);
      } else {
        throw new Error(`Error making request to Freshbooks API: ${error.message}`);
      }
    }
  }

  /**
   * Get clients from Freshbooks
   * @param params Query parameters
   * @returns List of clients
   */
  async getClients(params?: any): Promise<any> {
    return this.makeRequest('GET', '/accounting/account/:account_id/users/clients', undefined, { params });
  }

  /**
   * Get a single client by ID
   * @param clientId Client ID
   * @returns Client details
   */
  async getClient(clientId: string): Promise<any> {
    return this.makeRequest('GET', `/accounting/account/:account_id/users/clients/${clientId}`);
  }

  /**
   * Create a client in Freshbooks
   * @param client Client data
   * @returns Created client
   */
  async createClient(client: any): Promise<any> {
    return this.makeRequest('POST', '/accounting/account/:account_id/users/clients', { client });
  }

  /**
   * Update a client in Freshbooks
   * @param clientId Client ID
   * @param client Client data
   * @returns Updated client
   */
  async updateClient(clientId: string, client: any): Promise<any> {
    return this.makeRequest('PUT', `/accounting/account/:account_id/users/clients/${clientId}`, { client });
  }

  /**
   * Get invoices from Freshbooks
   * @param params Query parameters
   * @returns List of invoices
   */
  async getInvoices(params?: any): Promise<any> {
    return this.makeRequest('GET', '/accounting/account/:account_id/invoices/invoices', undefined, { params });
  }

  /**
   * Get a single invoice by ID
   * @param invoiceId Invoice ID
   * @returns Invoice details
   */
  async getInvoice(invoiceId: string): Promise<any> {
    return this.makeRequest('GET', `/accounting/account/:account_id/invoices/invoices/${invoiceId}`);
  }

  /**
   * Create an invoice in Freshbooks
   * @param invoice Invoice data
   * @returns Created invoice
   */
  async createInvoice(invoice: any): Promise<any> {
    return this.makeRequest('POST', '/accounting/account/:account_id/invoices/invoices', { invoice });
  }

  /**
   * Update an invoice in Freshbooks
   * @param invoiceId Invoice ID
   * @param invoice Invoice data
   * @returns Updated invoice
   */
  async updateInvoice(invoiceId: string, invoice: any): Promise<any> {
    return this.makeRequest('PUT', `/accounting/account/:account_id/invoices/invoices/${invoiceId}`, { invoice });
  }

  /**
   * Get expenses from Freshbooks
   * @param params Query parameters
   * @returns List of expenses
   */
  async getExpenses(params?: any): Promise<any> {
    return this.makeRequest('GET', '/accounting/account/:account_id/expenses/expenses', undefined, { params });
  }

  /**
   * Get a single expense by ID
   * @param expenseId Expense ID
   * @returns Expense details
   */
  async getExpense(expenseId: string): Promise<any> {
    return this.makeRequest('GET', `/accounting/account/:account_id/expenses/expenses/${expenseId}`);
  }

  /**
   * Create an expense in Freshbooks
   * @param expense Expense data
   * @returns Created expense
   */
  async createExpense(expense: any): Promise<any> {
    return this.makeRequest('POST', '/accounting/account/:account_id/expenses/expenses', { expense });
  }

  /**
   * Get payments from Freshbooks
   * @param params Query parameters
   * @returns List of payments
   */
  async getPayments(params?: any): Promise<any> {
    return this.makeRequest('GET', '/accounting/account/:account_id/payments/payments', undefined, { params });
  }

  /**
   * Get a single payment by ID
   * @param paymentId Payment ID
   * @returns Payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    return this.makeRequest('GET', `/accounting/account/:account_id/payments/payments/${paymentId}`);
  }

  /**
   * Create a payment in Freshbooks
   * @param payment Payment data
   * @returns Created payment
   */
  async createPayment(payment: any): Promise<any> {
    return this.makeRequest('POST', '/accounting/account/:account_id/payments/payments', { payment });
  }

  /**
   * Get projects from Freshbooks
   * @param params Query parameters
   * @returns List of projects
   */
  async getProjects(params?: any): Promise<any> {
    return this.makeRequest('GET', '/projects/business/:account_id/projects', undefined, { params });
  }

  /**
   * Get a single project by ID
   * @param projectId Project ID
   * @returns Project details
   */
  async getProject(projectId: string): Promise<any> {
    return this.makeRequest('GET', `/projects/business/:account_id/projects/${projectId}`);
  }

  /**
   * Create a project in Freshbooks
   * @param project Project data
   * @returns Created project
   */
  async createProject(project: any): Promise<any> {
    return this.makeRequest('POST', '/projects/business/:account_id/projects', project);
  }

  /**
   * Get time entries from Freshbooks
   * @param params Query parameters
   * @returns List of time entries
   */
  async getTimeEntries(params?: any): Promise<any> {
    return this.makeRequest('GET', '/timetracking/business/:account_id/time_entries', undefined, { params });
  }

  /**
   * Get a single time entry by ID
   * @param timeEntryId Time entry ID
   * @returns Time entry details
   */
  async getTimeEntry(timeEntryId: string): Promise<any> {
    return this.makeRequest('GET', `/timetracking/business/:account_id/time_entries/${timeEntryId}`);
  }

  /**
   * Create a time entry in Freshbooks
   * @param timeEntry Time entry data
   * @returns Created time entry
   */
  async createTimeEntry(timeEntry: any): Promise<any> {
    return this.makeRequest('POST', '/timetracking/business/:account_id/time_entries', timeEntry);
  }

  /**
   * Get a report from Freshbooks
   * @param reportType Report type (e.g., 'profit_loss', 'tax_summary', 'expense_details')
   * @param params Report parameters
   * @returns Report data
   */
  async getReport(reportType: string, params?: any): Promise<any> {
    return this.makeRequest('GET', `/accounting/account/:account_id/reports/${reportType}`, undefined, { params });
  }

  /**
   * Make a custom API call to Freshbooks
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
