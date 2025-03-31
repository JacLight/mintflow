import crypto from 'crypto';

// Sample data for each trigger type
const triggerSampleData = {
  newOrder: {
    merchant_id: 'MLTZ79VE64YTN',
    type: 'order.created',
    event_id: '03441e3a-47f1-49a7-a64c-55ab26703f8d',
    created_at: '2023-03-14T01:42:54.984089903Z',
    data: {
      type: 'order',
      id: 'eA3vssLHKJrv9H0IdJCM3gNqfdcZY',
      object: {
        order_created: {
          created_at: '2020-04-16T23:14:26.129Z',
          location_id: 'FPYCBCHYMXFK1',
          order_id: 'eA3vssLHKJrv9H0IdJCM3gNqfdcZY',
          state: 'OPEN',
          version: 1,
        },
      },
    },
  },
  orderUpdated: {
    merchant_id: 'MLTZ79VE64YTN',
    type: 'order.updated',
    event_id: '7e1d596e-ebf1-443d-87aa-a5f397bce1e5',
    created_at: '2023-03-14T01:56:10.454184371Z',
    data: {
      type: 'order',
      id: 'eA3vssLHKJrv9H0IdJCM3gNqfdcZY',
      object: {
        order_updated: {
          created_at: '2020-04-16T23:14:26.129Z',
          location_id: 'FPYCBCHYMXFK1',
          order_id: 'eA3vssLHKJrv9H0IdJCM3gNqfdcZY',
          state: 'OPEN',
          updated_at: '2020-04-16T23:14:26.359Z',
          version: 2,
        },
      },
    },
  },
  newCustomer: {
    merchant_id: 'MLTZ79VE64YTN',
    type: 'customer.created',
    event_id: '2985c7c7-2ccc-409e-8aba-998684732cab',
    created_at: '2023-03-14T01:57:28.679389163Z',
    data: {
      type: 'customer',
      id: 'QPTXM8PQNX3Q726ZYHPMNP46XC',
      object: {
        customer: {
          address: {
            address_line_1: '1018 40th Street',
            administrative_district_level_1: 'CA',
            locality: 'Oakland',
            postal_code: '94608',
          },
          birthday: '1962-03-04',
          created_at: '2022-11-09T21:23:25.519Z',
          creation_source: 'DIRECTORY',
          email_address: 'jenkins+smorly@squareup.com',
          family_name: 'Smorly',
          given_name: 'Jenkins',
          group_ids: ['JGJCW9S0G68NE.APPOINTMENTS'],
          id: 'QPTXM8PQNX3Q726ZYHPMNP46XC',
          phone_number: '+12126668929',
          preferences: {
            email_unsubscribed: false,
          },
          updated_at: '2022-11-09T21:23:25Z',
          version: 0,
        },
      },
    },
  },
  customerUpdated: {
    merchant_id: 'MLTZ79VE64YTN',
    type: 'customer.updated',
    event_id: 'f6e89469-de2f-4ae4-84c7-83a95681759a',
    created_at: '2023-03-14T01:58:22.076902762Z',
    data: {
      type: 'customer',
      id: 'A0AP25A6SCVTH8JES9BX01GXM4',
      object: {
        customer: {
          created_at: '2022-07-09T18:23:01.795Z',
          creation_source: 'THIRD_PARTY',
          email_address: 'jenkins+smorly@squareup.com',
          family_name: 'Smorly',
          given_name: 'Jenkins',
          id: 'A0AP25A6SCVTH8JES9BX01GXM4',
          phone_number: '+13477947111',
          preferences: {
            email_unsubscribed: false,
          },
          updated_at: '2022-11-09T21:38:30Z',
          version: 1,
        },
      },
    },
  },
  newAppointment: {
    merchant_id: 'MLTZ79VE64YTN',
    location_id: 'ES0RJRZYEC39A',
    type: 'booking.created',
    event_id: 'ee17dc22-5e38-4aba-ad15-af8e25adcc93',
    created_at: '2023-03-14T02:01:46.497709569Z',
    data: {
      type: 'booking',
      id: 'booking-id',
      object: {
        booking: {
          appointment_segments: [
            {
              duration_minutes: 60,
              service_variation_id: 'service-variation-id',
              service_variation_version: 1,
              team_member_id: 'team-member-id',
            },
          ],
          created_at: '2020-11-26T20:42:54Z',
          customer_id: 'customer-id',
          customer_note: '',
          id: 'booking-id',
          location_id: 'location-id',
          seller_note: '',
          start_at: '2020-11-26T21:00:00Z',
          status: 'ACCEPTED',
          updated_at: '2020-11-26T20:42:54Z',
          version: 0,
        },
      },
    },
  },
  newPayment: {
    merchant_id: 'MLTZ79VE64YTN',
    type: 'payment.created',
    event_id: '11fb274d-6882-417a-879c-faec367e0665',
    created_at: '2023-03-14T02:00:56.000119371Z',
    data: {
      type: 'payment',
      id: 'KkAkhdMsgzn59SM8A89WgKwekxLZY',
      object: {
        payment: {
          amount_money: {
            amount: 100,
            currency: 'USD',
          },
          approved_money: {
            amount: 100,
            currency: 'USD',
          },
          capabilities: [
            'EDIT_TIP_AMOUNT',
            'EDIT_TIP_AMOUNT_UP',
            'EDIT_TIP_AMOUNT_DOWN',
          ],
          card_details: {
            avs_status: 'AVS_ACCEPTED',
            card: {
              bin: '540988',
              card_brand: 'MASTERCARD',
              card_type: 'CREDIT',
              exp_month: 11,
              exp_year: 2022,
              fingerprint:
                'sq-1-Tvruf3vPQxlvI6n0IcKYfBukrcv6IqWr8UyBdViWXU2yzGn5VMJvrsHMKpINMhPmVg',
              last_4: '9029',
              prepaid_type: 'NOT_PREPAID',
            },
            card_payment_timeline: {
              authorized_at: '2020-11-22T21:16:51.198Z',
            },
            cvv_status: 'CVV_ACCEPTED',
            entry_method: 'KEYED',
            statement_description: 'SQ *DEFAULT TEST ACCOUNT',
            status: 'AUTHORIZED',
          },
          created_at: '2020-11-22T21:16:51.086Z',
          delay_action: 'CANCEL',
          delay_duration: 'PT168H',
          delayed_until: '2020-11-29T21:16:51.086Z',
          id: 'hYy9pRFVxpDsO1FB05SunFWUe9JZY',
          location_id: 'S8GWD5R9QB376',
          order_id: '03O3USaPaAaFnI6kkwB1JxGgBsUZY',
          receipt_number: 'hYy9',
          risk_evaluation: {
            created_at: '2020-11-22T21:16:51.198Z',
            risk_level: 'NORMAL',
          },
          source_type: 'CARD',
          status: 'APPROVED',
          total_money: {
            amount: 100,
            currency: 'USD',
          },
          updated_at: '2020-11-22T21:16:51.198Z',
          version_token: 'FfQhQJf9r3VSQIgyWBk1oqhIwiznLwVwJbVVA0bdyEv6o',
        },
      },
    },
  },
  newInvoice: {
    merchant_id: 'MLTZ79VE64YTN',
    location_id: 'ES0RJRZYEC39A',
    type: 'invoice.created',
    event_id: 'ee17dc22-5e38-4aba-ad15-af8e25adcc93',
    created_at: '2023-03-14T02:01:46.497709569Z',
    data: {
      type: 'invoice',
      id: 'inv:0-ChCHu2mZEabLeeHahQnXDjZQECY',
      object: {
        invoice: {
          accepted_payment_methods: {
            bank_account: false,
            buy_now_pay_later: false,
            card: true,
            square_gift_card: false,
          },
          created_at: '2020-06-18T17:45:13Z',
          custom_fields: [
            {
              label: 'Event Reference Number',
              placement: 'ABOVE_LINE_ITEMS',
              value: 'Ref. #1234',
            },
            {
              label: 'Terms of Service',
              placement: 'BELOW_LINE_ITEMS',
              value: 'The terms of service are...',
            },
          ],
          delivery_method: 'EMAIL',
          description: 'We appreciate your business!',
          id: 'inv:0-ChCHu2mZEabLeeHahQnXDjZQECY',
          invoice_number: 'inv-100',
          location_id: 'ES0RJRZYEC39A',
          order_id: 'CAISENgvlJ6jLWAzERDzjyHVybY',
          payment_requests: [
            {
              automatic_payment_source: 'NONE',
              computed_amount_money: {
                amount: 10000,
                currency: 'USD',
              },
              due_date: '2030-01-24',
              reminders: [
                {
                  message: 'Your invoice is due tomorrow',
                  relative_scheduled_days: -1,
                  status: 'PENDING',
                  uid: 'beebd363-e47f-4075-8785-c235aaa7df11',
                },
              ],
              request_type: 'BALANCE',
              tipping_enabled: true,
              total_completed_amount_money: {
                amount: 0,
                currency: 'USD',
              },
              uid: '2da7964f-f3d2-4f43-81e8-5aa220bf3355',
            },
          ],
          primary_recipient: {
            customer_id: 'JDKYHBWT1D4F8MFH63DBMEN8Y4',
            email_address: 'Amelia.Earhart@example.com',
            family_name: 'Earhart',
            given_name: 'Amelia',
            phone_number: '1-212-555-4240',
          },
          sale_or_service_date: '2030-01-24',
          scheduled_at: '2030-01-13T10:00:00Z',
          status: 'DRAFT',
          store_payment_method_enabled: false,
          timezone: 'America/Los_Angeles',
          title: 'Event Planning Services',
          updated_at: '2020-06-18T17:45:13Z',
          version: 0,
        },
      },
    },
  },
};

// Trigger definitions
export const triggers = [
  {
    name: 'new_order',
    displayName: 'New Order',
    description: 'Triggered when a new order is created',
    event: 'order.created',
    sampleData: triggerSampleData.newOrder,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.newOrder;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
  {
    name: 'order_updated',
    displayName: 'Order Updated',
    description: 'Triggered when an order is updated',
    event: 'order.updated',
    sampleData: triggerSampleData.orderUpdated,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.orderUpdated;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
  {
    name: 'new_customer',
    displayName: 'New Customer',
    description: 'Triggered when a customer is created',
    event: 'customer.created',
    sampleData: triggerSampleData.newCustomer,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.newCustomer;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
  {
    name: 'customer_updated',
    displayName: 'Customer Updated',
    description: 'Triggered when a customer is updated',
    event: 'customer.updated',
    sampleData: triggerSampleData.customerUpdated,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.customerUpdated;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
  {
    name: 'new_payment',
    displayName: 'New Payment',
    description: 'Triggered when a new payment is created',
    event: 'payment.created',
    sampleData: triggerSampleData.newPayment,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.newPayment;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
  {
    name: 'new_invoice',
    displayName: 'New Invoice',
    description: 'Triggered when a new invoice is created',
    event: 'invoice.created',
    sampleData: triggerSampleData.newInvoice,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.newInvoice;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
  {
    name: 'new_appointment',
    displayName: 'New Appointment',
    description: 'Triggered when a new appointment is created',
    event: 'booking.created',
    sampleData: triggerSampleData.newAppointment,
    inputSchema: {
      type: 'object',
      properties: {
        webhookUrl: {
          type: 'string',
          description: 'The webhook URL to receive Square events',
        },
        webhookSecret: {
          type: 'string',
          description: 'The webhook secret to verify Square events',
        },
        merchantId: {
          type: 'string',
          description: 'The Square merchant ID',
        },
      },
      required: ['webhookUrl', 'webhookSecret', 'merchantId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        merchant_id: { type: 'string' },
        type: { type: 'string' },
        event_id: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'object' },
      },
    },
    execute: async (input: any, config: any): Promise<any> => {
      // In a real implementation, this would set up a webhook subscription
      // For now, we'll just return the sample data
      return triggerSampleData.newAppointment;
    },
    verify: (input: any): boolean => {
      const { webhookSecret, payload, webhookUrl } = input;
      const signature = payload.headers['x-square-hmacsha256-signature'];
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(webhookUrl + payload.body);
      const hash = hmac.digest('base64');
      return hash === signature;
    },
  },
];
