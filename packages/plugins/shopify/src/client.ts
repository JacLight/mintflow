import axios, { AxiosInstance } from 'axios';
import {
    ShopifyAuth,
    ShopifyProduct,
    ShopifyCustomer,
    ShopifyOrder,
    ShopifyDraftOrder,
    ShopifyTransaction,
    ShopifyFulfillment,
    ShopifyFulfillmentEvent,
    ShopifyCollect,
    ShopifyImage,
    ShopifyProductVariant,
    ShopifyCheckout
} from './models.js';

export class ShopifyClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private apiVersion = '2023-10';

    constructor(private auth: ShopifyAuth, axiosInstance?: AxiosInstance) {
        this.axiosInstance = axiosInstance || axios;
        this.baseUrl = this.getBaseUrl(auth.shopName);
    }

    /**
     * Get the base URL for the Shopify API
     */
    private getBaseUrl(shopName: string): string {
        return `https://${shopName}.myshopify.com/admin/api/${this.apiVersion}`;
    }

    /**
     * Validate the authentication by fetching the shop information
     */
    async validateAuth(): Promise<boolean> {
        try {
            await this.getShopInfo();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get information about the shop
     */
    async getShopInfo(): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/shop.json'
        });
        return response.data.shop;
    }

    /**
     * Get all customers
     */
    async getCustomers(): Promise<ShopifyCustomer[]> {
        let customers: ShopifyCustomer[] = [];
        let hasNextPage = true;
        let queryParams: Record<string, string> = {};

        while (hasNextPage) {
            const response = await this.sendRequest({
                method: 'get',
                url: '/customers.json',
                params: queryParams
            });

            customers = customers.concat(response.data.customers);

            const linkHeader = response.headers?.['link'];
            if (linkHeader && typeof linkHeader === 'string' && linkHeader.includes('rel="next"')) {
                // Extract the URL for the next page from the Link header
                const nextLink = linkHeader
                    .split(',')
                    .find((s) => s.includes('rel="next"'))
                    ?.match(/<(.*?)>/)?.[1];

                if (nextLink) {
                    queryParams.page_info = new URL(nextLink).searchParams.get('page_info') || '';
                } else {
                    hasNextPage = false;
                }
            } else {
                hasNextPage = false;
            }
        }

        return customers;
    }

    /**
     * Get a specific customer by ID
     */
    async getCustomer(id: string): Promise<ShopifyCustomer> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/customers/${id}.json`
        });
        return response.data.customer;
    }

    /**
     * Create a new customer
     */
    async createCustomer(customer: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/customers.json',
            data: {
                customer
            }
        });
        return response.data.customer;
    }

    /**
     * Update an existing customer
     */
    async updateCustomer(id: string, customer: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/customers/${id}.json`,
            data: {
                customer
            }
        });
        return response.data.customer;
    }

    /**
     * Get orders for a specific customer
     */
    async getCustomerOrders(id: string): Promise<ShopifyOrder[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/customers/${id}/orders.json`
        });
        return response.data.orders;
    }

    /**
     * Get all products
     */
    async getProducts(search?: {
        title?: string;
        createdAtMin?: string;
        updatedAtMin?: string;
    }): Promise<ShopifyProduct[]> {
        let products: ShopifyProduct[] = [];
        let hasNextPage = true;
        let queryParams: Record<string, string> = {};

        if (search) {
            if (search.title) queryParams.title = search.title;
            if (search.createdAtMin) queryParams.created_at_min = search.createdAtMin;
            if (search.updatedAtMin) queryParams.updated_at_min = search.updatedAtMin;
        }

        while (hasNextPage) {
            const response = await this.sendRequest({
                method: 'get',
                url: '/products.json',
                params: queryParams
            });

            products = products.concat(response.data.products);

            const linkHeader = response.headers?.['link'];
            if (linkHeader && typeof linkHeader === 'string' && linkHeader.includes('rel="next"')) {
                // Extract the URL for the next page from the Link header
                const nextLink = linkHeader
                    .split(',')
                    .find((s) => s.includes('rel="next"'))
                    ?.match(/<(.*?)>/)?.[1];

                if (nextLink) {
                    queryParams.page_info = new URL(nextLink).searchParams.get('page_info') || '';
                } else {
                    hasNextPage = false;
                }
            } else {
                hasNextPage = false;
            }
        }

        return products;
    }

    /**
     * Get a specific product by ID
     */
    async getProduct(id: number): Promise<ShopifyProduct> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/products/${id}.json`
        });
        return response.data.product;
    }

    /**
     * Create a new product
     */
    async createProduct(product: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/products.json',
            data: {
                product
            }
        });
        return response.data.product;
    }

    /**
     * Update an existing product
     */
    async updateProduct(id: number, product: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/products/${id}.json`,
            data: {
                product
            }
        });
        return response.data.product;
    }

    /**
     * Get a specific product variant by ID
     */
    async getProductVariant(id: number): Promise<ShopifyProductVariant> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/variants/${id}.json`
        });
        return response.data.variant;
    }

    /**
     * Create a draft order
     */
    async createDraftOrder(draftOrder: Partial<ShopifyDraftOrder>): Promise<ShopifyDraftOrder> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/draft_orders.json',
            data: {
                draft_order: draftOrder
            }
        });
        return response.data.draft_order;
    }

    /**
     * Create an order
     */
    async createOrder(order: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/orders.json',
            data: {
                order
            }
        });
        return response.data.order;
    }

    /**
     * Update an order
     */
    async updateOrder(id: number, order: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/orders/${id}.json`,
            data: {
                order
            }
        });
        return response.data.order;
    }

    /**
     * Close an order
     */
    async closeOrder(id: number): Promise<ShopifyOrder> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/orders/${id}/close.json`,
            data: {}
        });
        return response.data.order;
    }

    /**
     * Cancel an order
     */
    async cancelOrder(id: number): Promise<ShopifyOrder> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/orders/${id}/cancel.json`,
            data: {}
        });
        return response.data.order;
    }

    /**
     * Create a transaction for an order
     */
    async createTransaction(orderId: number, transaction: Partial<ShopifyTransaction>): Promise<ShopifyTransaction> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/orders/${orderId}/transactions.json`,
            data: {
                transaction
            }
        });
        return response.data.transaction;
    }

    /**
     * Get a specific transaction
     */
    async getTransaction(orderId: number, id: number): Promise<ShopifyTransaction> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/orders/${orderId}/transactions/${id}.json`
        });
        return response.data.transaction;
    }

    /**
     * Get all transactions for an order
     */
    async getTransactions(orderId: number): Promise<ShopifyTransaction[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/orders/${orderId}/transactions.json`
        });
        return response.data.transactions;
    }

    /**
     * Get all fulfillments for an order
     */
    async getFulfillments(orderId: number): Promise<ShopifyFulfillment[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/orders/${orderId}/fulfillments.json`
        });
        return response.data.fulfillments;
    }

    /**
     * Get a specific fulfillment
     */
    async getFulfillment(orderId: number, id: number): Promise<ShopifyFulfillment> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/orders/${orderId}/fulfillments/${id}.json`
        });
        return response.data.fulfillment;
    }

    /**
     * Create a fulfillment event
     */
    async createFulfillmentEvent(orderId: number, fulfillmentId: number, event: Partial<ShopifyFulfillmentEvent>): Promise<ShopifyFulfillmentEvent> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/orders/${orderId}/fulfillments/${fulfillmentId}/events.json`,
            data: {
                event
            }
        });
        return response.data.fulfillment_event;
    }

    /**
     * Get all locations
     */
    async getLocations(): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/locations.json'
        });
        return response.data.locations;
    }

    /**
     * Adjust inventory level
     */
    async adjustInventoryLevel(inventoryItemId: number, locationId: number, adjustment: number): Promise<any> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/inventory_levels/adjust.json',
            data: {
                inventory_item_id: inventoryItemId,
                location_id: locationId,
                available_adjustment: adjustment
            }
        });
        return response.data;
    }

    /**
     * Create a collect (add a product to a collection)
     */
    async createCollect(collect: Partial<ShopifyCollect>): Promise<ShopifyCollect> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/collects.json',
            data: {
                collect
            }
        });
        return response.data.collect;
    }

    /**
     * Get an asset
     */
    async getAsset(key: string, themeId: number): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/themes/${themeId}/assets.json`,
            params: {
                key
            }
        });
        return response.data.asset;
    }

    /**
     * Upload a product image
     */
    async uploadProductImage(productId: number, image: Partial<ShopifyImage>): Promise<ShopifyImage> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/products/${productId}/images.json`,
            data: {
                image
            }
        });
        return response.data.image;
    }

    /**
     * Get abandoned checkouts
     */
    async getAbandonedCheckouts(sinceId?: string): Promise<ShopifyCheckout[]> {
        const params: Record<string, string> = {};
        if (sinceId) {
            params.since_id = sinceId;
        }

        const response = await this.sendRequest({
            method: 'get',
            url: '/checkouts.json',
            params
        });
        return response.data.checkouts;
    }

    /**
     * Create a webhook
     */
    async createWebhook(topic: string, address: string): Promise<{ id: string }> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/webhooks.json',
            data: {
                webhook: {
                    topic,
                    address,
                    format: 'json'
                }
            }
        });
        return { id: response.data.webhook.id };
    }

    /**
     * Delete a webhook
     */
    async deleteWebhook(id: string): Promise<void> {
        await this.sendRequest({
            method: 'delete',
            url: `/webhooks/${id}.json`
        });
    }

    /**
     * Send a request to the Shopify API
     */
    private async sendRequest(config: any): Promise<any> {
        return this.axiosInstance({
            ...config,
            url: `${this.baseUrl}${config.url}`,
            headers: {
                'X-Shopify-Access-Token': this.auth.adminToken,
                'Content-Type': 'application/json',
                ...config.headers
            }
        });
    }
}
