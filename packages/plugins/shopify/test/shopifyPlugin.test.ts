import shopifyPlugin, { ShopifyClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ShopifyProductStatuses } from '../src/models.js';

describe('shopifyPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeShopify: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeShopify = shopifyPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should get products successfully', async () => {
        // Mock the products endpoint
        mock.onGet('https://test-shop.myshopify.com/admin/api/2023-10/products.json').reply(200, {
            products: [
                {
                    id: 123456789,
                    title: 'Test Product',
                    body_html: '<p>Test description</p>',
                    vendor: 'Test Vendor',
                    product_type: 'Test Type',
                    created_at: '2023-01-01T00:00:00-00:00',
                    updated_at: '2023-01-02T00:00:00-00:00',
                    status: ShopifyProductStatuses.ACTIVE,
                    tags: 'tag1, tag2',
                    images: []
                }
            ]
        });

        const input = {
            action: 'get_products',
            shopName: 'test-shop',
            adminToken: 'test-token'
        };

        // Pass the axiosInstance in the context
        const result = await executeShopify(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 123456789,
                title: 'Test Product',
                body_html: '<p>Test description</p>',
                vendor: 'Test Vendor',
                product_type: 'Test Type',
                created_at: '2023-01-01T00:00:00-00:00',
                updated_at: '2023-01-02T00:00:00-00:00',
                status: ShopifyProductStatuses.ACTIVE,
                tags: 'tag1, tag2',
                images: []
            }
        ]);
    });

    it('should get a specific product successfully', async () => {
        // Mock the product endpoint
        mock.onGet('https://test-shop.myshopify.com/admin/api/2023-10/products/123456789.json').reply(200, {
            product: {
                id: 123456789,
                title: 'Test Product',
                body_html: '<p>Test description</p>',
                vendor: 'Test Vendor',
                product_type: 'Test Type',
                created_at: '2023-01-01T00:00:00-00:00',
                updated_at: '2023-01-02T00:00:00-00:00',
                status: ShopifyProductStatuses.ACTIVE,
                tags: 'tag1, tag2',
                images: []
            }
        });

        const input = {
            action: 'get_product',
            shopName: 'test-shop',
            adminToken: 'test-token',
            productId: '123456789'
        };

        // Pass the axiosInstance in the context
        const result = await executeShopify(input, { axiosInstance });

        expect(result).toEqual({
            id: 123456789,
            title: 'Test Product',
            body_html: '<p>Test description</p>',
            vendor: 'Test Vendor',
            product_type: 'Test Type',
            created_at: '2023-01-01T00:00:00-00:00',
            updated_at: '2023-01-02T00:00:00-00:00',
            status: ShopifyProductStatuses.ACTIVE,
            tags: 'tag1, tag2',
            images: []
        });
    });

    it('should create a product successfully', async () => {
        // Mock the create product endpoint
        mock.onPost('https://test-shop.myshopify.com/admin/api/2023-10/products.json').reply(200, {
            product: {
                id: 123456789,
                title: 'New Product',
                body_html: '<p>New product description</p>',
                vendor: 'Test Vendor',
                product_type: 'Test Type',
                created_at: '2023-01-01T00:00:00-00:00',
                updated_at: '2023-01-01T00:00:00-00:00',
                status: ShopifyProductStatuses.DRAFT,
                tags: 'new, product',
                images: []
            }
        });

        const productData = {
            title: 'New Product',
            body_html: '<p>New product description</p>',
            vendor: 'Test Vendor',
            product_type: 'Test Type',
            status: ShopifyProductStatuses.DRAFT,
            tags: 'new, product'
        };

        const input = {
            action: 'create_product',
            shopName: 'test-shop',
            adminToken: 'test-token',
            productData
        };

        // Pass the axiosInstance in the context
        const result = await executeShopify(input, { axiosInstance });

        expect(result).toEqual({
            id: 123456789,
            title: 'New Product',
            body_html: '<p>New product description</p>',
            vendor: 'Test Vendor',
            product_type: 'Test Type',
            created_at: '2023-01-01T00:00:00-00:00',
            updated_at: '2023-01-01T00:00:00-00:00',
            status: ShopifyProductStatuses.DRAFT,
            tags: 'new, product',
            images: []
        });
    });

    it('should get customers successfully', async () => {
        // Mock the customers endpoint
        mock.onGet('https://test-shop.myshopify.com/admin/api/2023-10/customers.json').reply(200, {
            customers: [
                {
                    id: 123456789,
                    email: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    orders_count: 5,
                    state: 'enabled',
                    total_spent: 500.00,
                    verified_email: true,
                    tags: 'vip',
                    phone: '+1234567890',
                    addresses: []
                }
            ]
        });

        const input = {
            action: 'get_customers',
            shopName: 'test-shop',
            adminToken: 'test-token'
        };

        // Pass the axiosInstance in the context
        const result = await executeShopify(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 123456789,
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                orders_count: 5,
                state: 'enabled',
                total_spent: 500.00,
                verified_email: true,
                tags: 'vip',
                phone: '+1234567890',
                addresses: []
            }
        ]);
    });

    it('should create an order successfully', async () => {
        // Mock the create order endpoint
        mock.onPost('https://test-shop.myshopify.com/admin/api/2023-10/orders.json').reply(200, {
            order: {
                id: 123456789,
                email: 'customer@example.com',
                created_at: '2023-01-01T00:00:00-00:00',
                updated_at: '2023-01-01T00:00:00-00:00',
                total_price: '100.00',
                subtotal_price: '90.00',
                total_tax: '10.00',
                currency: 'USD',
                financial_status: 'pending',
                line_items: [
                    {
                        id: 987654321,
                        variant_id: 123456,
                        product_id: 654321,
                        title: 'Test Product',
                        quantity: 1,
                        price: '90.00'
                    }
                ]
            }
        });

        const orderData = {
            email: 'customer@example.com',
            line_items: [
                {
                    variant_id: 123456,
                    quantity: 1
                }
            ]
        };

        const input = {
            action: 'create_order',
            shopName: 'test-shop',
            adminToken: 'test-token',
            orderData
        };

        // Pass the axiosInstance in the context
        const result = await executeShopify(input, { axiosInstance });

        expect(result).toEqual({
            id: 123456789,
            email: 'customer@example.com',
            created_at: '2023-01-01T00:00:00-00:00',
            updated_at: '2023-01-01T00:00:00-00:00',
            total_price: '100.00',
            subtotal_price: '90.00',
            total_tax: '10.00',
            currency: 'USD',
            financial_status: 'pending',
            line_items: [
                {
                    id: 987654321,
                    variant_id: 123456,
                    product_id: 654321,
                    title: 'Test Product',
                    quantity: 1,
                    price: '90.00'
                }
            ]
        });
    });

    it('should process a webhook payload successfully', async () => {
        const webhookPayload = {
            id: 123456789,
            email: 'customer@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '+1234567890',
            created_at: '2023-01-01T00:00:00-00:00'
        };

        const input = {
            action: 'process_webhook',
            shopName: 'test-shop',
            adminToken: 'test-token',
            webhookPayload,
            webhookTopic: 'customers/create'
        };

        // Pass the axiosInstance in the context
        const result = await executeShopify(input, { axiosInstance });

        expect(result).toEqual({
            topic: 'customers/create',
            data: webhookPayload
        });
    });

    it('should throw an error for invalid action', async () => {
        const input = {
            action: 'invalid_action',
            shopName: 'test-shop',
            adminToken: 'test-token'
        };

        // Pass the axiosInstance in the context
        await expect(executeShopify(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        const input = {
            action: 'get_product',
            shopName: 'test-shop',
            adminToken: 'test-token'
            // Missing productId
        };

        // Pass the axiosInstance in the context
        await expect(executeShopify(input, { axiosInstance })).rejects.toThrow('Missing required parameter: productId');
    });
});
