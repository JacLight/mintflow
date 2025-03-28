import { woocommerceRegisterTrigger } from './register-trigger.js';

const sampleData = {
  product: {
    id: 20,
    sku: '',
    name: 'My Product',
    slug: 'my-product',
    tags: [],
    type: 'simple',
    price: '5',
    _links: {
      self: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/products/20',
        },
      ],
      collection: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/products',
        },
      ],
    },
    images: [],
    description: '<p>Description <strong>bold</strong></p>\n<p>New Line</p>\n',
    date_created: '2023-07-06T14:51:45',
    date_modified: '2023-07-06T14:51:45',
    total_sales: 0,
    stock_status: 'instock',
    rating_count: 0,
    status: 'publish',
    weight: '',
    on_sale: false,
    virtual: false,
    featured: false,
    downloads: [],
    meta_data: [],
    parent_id: 0,
    permalink: 'https://myshop.com/?product=my-product',
    tax_class: '',
    attributes: [],
    backorders: 'no',
    categories: [
      {
        id: 15,
        name: 'Uncategorized',
        slug: 'uncategorized',
      },
    ],
    dimensions: {
      width: '',
      height: '',
      length: '',
    },
    menu_order: 0,
    price_html:
      '<span class="woocommerce-Price-amount amount"><bdi>5,000 <span class="woocommerce-Price-currencySymbol">د.ا</span></bdi></span>',
    sale_price: '',
    tax_status: 'taxable',
    upsell_ids: [],
    variations: [],
    backordered: false,
    button_text: '',
    has_options: false,
    purchasable: true,
    related_ids: [12],
    downloadable: false,
    external_url: '',
    manage_stock: false,
    purchase_note: '',
    regular_price: '5',
    average_rating: '0.00',
    cross_sell_ids: [],
    download_limit: -1,
    shipping_class: '',
    stock_quantity: null,
    date_on_sale_to: null,
    download_expiry: -1,
    reviews_allowed: true,
    date_created_gmt: '2023-07-06T14:51:45',
    grouped_products: [],
    low_stock_amount: null,
    shipping_taxable: true,
    date_modified_gmt: '2023-07-06T14:51:45',
    date_on_sale_from: null,
    shipping_class_id: 0,
    shipping_required: true,
    short_description: '',
    sold_individually: false,
    backorders_allowed: false,
    catalog_visibility: 'visible',
    default_attributes: [],
    date_on_sale_to_gmt: null,
    date_on_sale_from_gmt: null,
  },
  order: {
    id: 17,
    total: '2.000',
    _links: {
      self: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/orders/17',
        },
      ],
      customer: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/customers/1',
        },
      ],
      collection: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/orders',
        },
      ],
    },
    number: '17',
    status: 'pending',
    shipping_total: '0.000',
    currency_symbol: '$',
    date_created_gmt: '2023-07-06T14:17:03',
    payment_method_title: 'Cash on delivery',
    billing: {
      city: 'City',
      email: 'email@gmail.com',
      phone: '123123123',
      state: 'State',
      company: '',
      country: 'CO',
      postcode: '11111',
      address_1: '1 Street',
      address_2: '',
      last_name: 'Last',
      first_name: 'First',
    },
    refunds: [],
    version: '7.8.2',
    cart_tax: '0.000',
    currency: 'USD',
    shipping: {
      city: 'City',
      phone: '',
      state: 'State',
      company: '',
      country: 'CO',
      postcode: '11111',
      address_1: '1 Street',
      address_2: '',
      last_name: 'Last',
      first_name: 'First',
    },
    date_paid: null,
    fee_lines: [],
    meta_data: [
      {
        id: 228,
        key: 'is_vat_exempt',
        value: 'no',
      },
    ],
    order_key: 'wc_order_C66uDC3RekAax',
    parent_id: 0,
    tax_lines: [],
    total_tax: '0.000',
    line_items: [
      {
        id: 9,
        sku: '',
        name: 'First Product',
        image: {
          id: '',
          src: '',
        },
        price: 1,
        taxes: [],
        total: '2.000',
        quantity: 2,
        subtotal: '2.000',
        meta_data: [],
        tax_class: '',
        total_tax: '0.000',
        product_id: 12,
        parent_name: null,
        subtotal_tax: '0.000',
        variation_id: 0,
      },
    ],
    created_via: 'checkout',
    customer_id: 1,
    is_editable: false,
    payment_url:
      'https://myshop.com/?page_id=8&order-pay=17&pay_for_order=true&key=wc_order_C66uDC3RekAax',
    coupon_lines: [],
    date_created: '2023-07-06T14:17:03',
    discount_tax: '0.000',
    shipping_tax: '0.000',
    customer_note: '',
    date_modified: '2023-07-06T14:25:02',
    date_paid_gmt: null,
    needs_payment: true,
    date_completed: null,
    discount_total: '0.000',
    payment_method: 'cod',
    shipping_lines: [
      {
        id: 10,
        taxes: [],
        total: '0.000',
        meta_data: [
          {
            id: 75,
            key: 'Items',
            value: 'First Product × 2',
            display_key: 'Items',
            display_value: 'First Product × 2',
          },
        ],
        method_id: 'free_shipping',
        total_tax: '0.000',
        instance_id: '1',
        method_title: 'Free shipping',
      },
    ],
    transaction_id: '',
    needs_processing: true,
    date_modified_gmt: '2023-07-06T14:25:02',
    prices_include_tax: false,
  },
  coupon: {
    id: 22,
    code: '5dollars',
    _links: {
      self: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/coupons/22',
        },
      ],
      collection: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/coupons',
        },
      ],
    },
    amount: '5.00',
    status: 'publish',
    used_by: [],
    meta_data: [],
    description: '',
    product_ids: [20],
    usage_count: 0,
    usage_limit: null,
    date_created: '2023-07-09T15:10:14',
    date_expires: '2023-07-31T00:00:00',
    date_modified: '2023-07-09T15:23:03',
    discount_type: 'fixed_cart',
    free_shipping: true,
    maximum_amount: '0.00',
    minimum_amount: '0.00',
    date_created_gmt: '2023-07-09T15:10:14',
    date_expires_gmt: '2023-07-31T00:00:00',
    date_modified_gmt: '2023-07-09T15:23:03',
    usage_limit_per_user: 1,
    individual_use: false,
    email_restrictions: [],
    exclude_sale_items: false,
    product_categories: [],
    excluded_product_ids: [],
    limit_usage_to_x_items: null,
    excluded_product_categories: [],
  },
  customer: {
    id: 1,
    role: 'administrator',
    email: 'email@gmail.com',
    avatar_url: '',
    username: 'username',
    first_name: 'First',
    last_name: 'Last',
    date_created: '2023-07-05T14:13:10',
    date_modified: '2023-07-06T14:58:43',
    date_created_gmt: '2023-07-05T14:13:10',
    date_modified_gmt: '2023-07-06T14:58:43',
    is_paying_customer: false,
    _links: {
      self: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/customers/1',
        },
      ],
      collection: [
        {
          href: 'https://myshop.com/index.php?rest_route=/wc/v3/customers',
        },
      ],
    },
    billing: {
      city: 'City',
      email: 'email@gmail.com',
      phone: '123123123',
      state: 'State',
      company: '',
      country: 'CO',
      postcode: '11111',
      address_1: '# Street',
      address_2: '',
      last_name: 'Last',
      first_name: 'First',
    },
    shipping: {
      city: 'City',
      email: 'email@gmail.com',
      phone: '123123123',
      state: 'State',
      company: '',
      country: 'CO',
      postcode: '11111',
      address_1: '# Street',
      address_2: '',
      last_name: 'Last',
      first_name: 'First',
    },
  },
};

export const triggers = [
  {
    name: 'product_created',
    topic: 'product.created',
    displayName: 'Product Created',
    description: 'Triggers when new product is created.',
    sampleData: sampleData.product,
  },
  {
    name: 'product_updated',
    topic: 'product.updated',
    displayName: 'Product Updated',
    description: 'Triggers when an existing product is updated.',
    sampleData: sampleData.product,
  },
  {
    name: 'product_deleted',
    topic: 'product.deleted',
    displayName: 'Product Deleted',
    description: 'Triggers when an existing product is deleted.',
    sampleData: sampleData.product,
  },
  {
    name: 'order_created',
    topic: 'order.created',
    displayName: 'Order Created',
    description: 'Triggers when new order is created.',
    sampleData: sampleData.order,
  },
  {
    name: 'order_updated',
    topic: 'order.updated',
    displayName: 'Order Updated',
    description: 'Triggers when an existing order is updated.',
    sampleData: sampleData.order,
  },
  {
    name: 'order_deleted',
    topic: 'order.deleted',
    displayName: 'Order Deleted',
    description: 'Triggers when an existing order is deleted.',
    sampleData: sampleData.order,
  },
  {
    name: 'coupon_created',
    topic: 'coupon.created',
    displayName: 'Coupon Created',
    description: 'Triggers when new coupon is created.',
    sampleData: sampleData.coupon,
  },
  {
    name: 'coupon_updated',
    topic: 'coupon.updated',
    displayName: 'Coupon Updated',
    description: 'Triggers when an existing coupon is updated.',
    sampleData: sampleData.coupon,
  },
  {
    name: 'coupon_deleted',
    topic: 'coupon.deleted',
    displayName: 'Coupon Deleted',
    description: 'Triggers when an existing coupon is deleted.',
    sampleData: sampleData.coupon,
  },
  {
    name: 'customer_created',
    topic: 'customer.created',
    displayName: 'Customer Created',
    description: 'Triggers when new customer is created.',
    sampleData: sampleData.customer,
  },
  {
    name: 'customer_updated',
    topic: 'customer.updated',
    displayName: 'Customer Updated',
    description: 'Triggers when an existing customer is updated.',
    sampleData: sampleData.customer,
  },
  {
    name: 'customer_deleted',
    topic: 'customer.deleted',
    displayName: 'Customer Deleted',
    description: 'Triggers when an existing customer is deleted.',
    sampleData: sampleData.customer,
  },
].map((trigger) => woocommerceRegisterTrigger(trigger));
