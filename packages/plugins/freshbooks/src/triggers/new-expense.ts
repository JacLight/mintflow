import { FreshbooksClient } from '../utils/index.js';

export const newExpense = {
  name: 'new_expense',
  displayName: 'New Expense',
  description: 'Triggers when a new expense is created in Freshbooks',
  type: 'polling',
  sampleData: {
    expense: {
      id: 123456,
      staffid: 1,
      categoryid: 4,
      clientid: 5678,
      projectid: 9012,
      date: '2023-01-15',
      amount: {
        amount: '150.00',
        code: 'USD',
      },
      notes: 'Office supplies',
      status: 0,
      billable: true,
      taxName1: 'Tax',
      taxAmount1: 10,
      taxName2: '',
      taxAmount2: 0,
      account_name: 'Expenses',
      vendor: 'Office Depot',
      has_receipt: false,
      include_receipt: false,
      updated: '2023-01-15 12:00:00',
    },
  },
  async run(context: any): Promise<any> {
    const auth = context.auth;
    const store = context.store;

    try {
      // Create Freshbooks client
      const client = new FreshbooksClient(auth);

      // Get the last poll time from the store
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();
      
      // Update the last poll time
      const currentTime = new Date().toISOString();
      store.set('lastPollTime', currentTime);

      // Get expenses created since the last poll
      // Freshbooks API doesn't support filtering by created_at directly,
      // so we'll get all expenses and filter them in code
      const response = await client.getExpenses({
        per_page: 100,
        sort: 'date_desc', // Get newest first
      });

      if (!response.response || !response.response.result || !response.response.result.expenses) {
        return [];
      }

      // Filter out expenses that are not new
      const newExpenses = response.response.result.expenses.filter((expense: any) => {
        // Check if the expense was created after the last poll
        // Freshbooks uses updated field for the last update timestamp
        const updated = expense.updated;
        if (!updated) return false;
        
        const updatedDate = new Date(updated);
        const lastPollDate = new Date(lastPollTime);
        
        return updatedDate > lastPollDate;
      });

      // Return the new expenses
      return newExpenses.map((expense: any) => ({
        expense,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get new expenses: ${error.message}`);
    }
  },
};
