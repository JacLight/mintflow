export type APIEndpointName = keyof typeof appmintEndpoints;
export const getAppEnginePath = (appConfig: any) => {
  return `${appConfig.appengine.host}`;
};

export const appmintEndpoints = {
  batch_log_data: {
    name: 'batch_log_data',
    method: 'post',
    path: 'batch/log/data',
  },
  get: {
    name: 'get',
    method: 'get',
    path: 'repository/get',
  },
  get_collection: {
    name: 'get_collection',
    method: 'get',
    path: 'repository/collection',
  },
  get_collections: {
    name: 'get_collections',
    method: 'get',
    path: 'repository/collections',
  },
  isunique: {
    name: 'isunique',
    method: 'get',
    path: 'repository/isunique',
  },
  find_by_attribute: {
    name: 'find_by_attribute',
    method: 'get',
    path: 'repository/find-by-attribute',
  },
  get_site: {
    name: 'get_site',
    method: 'get',
    path: 'site/get-site',
  },
  get_page: {
    name: 'get_page',
    method: 'get',
    path: 'site/page',
  },
  get_page_section: {
    name: 'get_page_section',
    method: 'get',
    path: 'site/page-section',
  },
  query: {
    name: 'query',
    method: 'get',
    path: 'repository/query',
  },
  user_orgs: {
    name: 'user_orgs',
    method: 'get',
    path: 'repository/org/user',
  },
  user_org_delete: {
    name: 'user_org_delete',
    method: 'delete',
    path: 'repository/org/user',
  },
  search_raw: {
    name: 'search_raw',
    method: 'post',
    path: 'search/search',
  },
  search_stat_count: {
    name: 'search_stat_count',
    method: 'get',
    path: 'search/stat/count',
  },
  search_stat_histogram: {
    name: 'search_stat_histogram',
    method: 'get',
    path: 'search/stat/histogram',
  },
  search: {
    name: 'search',
    method: 'get',
    path: 'repository/search',
  },
  search_asset: {
    name: 'search_asset',
    method: 'post',
    path: 'repository/search-asset',
  },
  find: {
    name: 'find',
    method: 'post',
    path: 'repository/find',
  },
  find_asset: {
    name: 'find_asset',
    method: 'post',
    path: 'repository/find-asset',
  },
  create: {
    name: 'create',
    method: 'put',
    path: 'repository/create',
  },
  update: {
    name: 'update',
    method: 'post',
    path: 'repository/update',
  },
  get_activities: {
    name: 'get_activities',
    method: 'get',
    path: 'repository/activities/get',
  },
  logout: {
    name: 'logout',
    method: 'get',
    path: 'profile/logout',
  },
  login: {
    name: 'login',
    method: 'post',
    path: 'profile/customer/signin',
  },
  dashboard_auth: {
    name: 'dashboard_auth',
    method: 'get',
    path: 'profile/customer/dashboard/auth',
  },
  login_magiclink: {
    name: 'login_magiclink',
    method: 'get',
    path: 'profile/magiclink',
  },
  login_facebook: {
    name: 'login_facebook',
    method: 'get',
    path: 'profile/facebook',
  },
  login_google: {
    name: 'login_google',
    method: 'get',
    path: 'profile/google',
  },
  login_code: {
    name: 'login_code',
    method: 'get',
    path: 'profile/code',
  },
  refresh_token: {
    name: 'refresh_token',
    method: 'post',
    path: 'profile/customer/refresh',
  },
  register: {
    name: 'register',
    method: 'post',
    path: 'profile/customer/signup',
  },
  forget_password: {
    name: 'forgot_password',
    method: 'get',
    path: 'profile/customer/password/forgot',
  },
  reset_password: {
    name: 'reset_password',
    method: 'post',
    path: 'profile/customer/password/reset',
  },
  profile_update: {
    name: 'profile_update',
    method: 'post',
    path: 'profile/customer/update',
  },
  appkey: {
    name: 'appkey',
    method: 'post',
    path: 'profile/app/key',
  },
  delete: {
    name: 'delete',
    method: 'del',
    path: 'repository/delete',
  },
  delete_bulk: {
    name: 'delete_bulk',
    method: 'post',
    path: 'repository/delete',
  },
  profile: {
    name: 'profile',
    method: 'post',
    path: 'profile',
  },
  file_delete: {
    name: 'file_delete',
    method: 'post',
    path: 'repository/customer/file/delete',
  },
  file_upload: {
    name: 'file_upload',
    method: 'post',
    path: 'repository/customer/file/upload',
  },
  file_flatlist: {
    name: 'file_flatlist',
    method: 'post',
    path: 'repository/customer/file/flatlist',
  },
  products: {
    name: 'products',
    method: 'get',
    path: 'storefront/products',
  },
  product: {
    name: 'product',
    method: 'get',
    path: 'storefront/product',
  },
  product_category: {
    name: 'products_category',
    method: 'get',
    path: 'storefront/product/category',
  },
  product_search: {
    name: 'product_search',
    method: 'post',
    path: 'storefront/search',
  },
  product_find: {
    name: 'product_find',
    method: 'post',
    path: 'storefront/find',
  },
  product_brands: {
    name: 'product_brands',
    method: 'get',
    path: 'storefront/brands',
  },
  product_collections: {
    name: 'product_collections',
    method: 'get',
    path: 'storefront/collections',
  },
  product_categories: {
    name: 'product_categories',
    method: 'get',
    path: 'storefront/categories',
  },
  order_id: {
    name: 'order_id',
    method: 'get',
    path: 'storefront/order/get',
  },
  order_email: {
    name: 'order_email',
    method: 'get',
    path: 'storefront/order/email',
  },
  orders: {
    name: 'orders',
    method: 'get',
    path: 'storefront/orders/get',
  },
  checkout_payment_gateways: {
    name: 'checkout_payment_gateways',
    method: 'get',
    path: 'storefront/payment_gateways',
  },
  subscriptions_get: {
    name: 'subscriptions_get',
    method: 'get',
    path: 'storefront/subscriptions/get',
  },
  upstream_call: {
    name: 'upstream_call',
    method: 'post',
    path: 'upstream/call',
  },
  upstream_get_config: {
    name: 'upstream_get_config',
    method: 'get',
    path: 'upstream/get-config',
  },
  crm_ticket_get: {
    name: 'crm_ticket_get',
    method: 'get',
    path: 'crm/tickets/get',
  },
  crm_ticket_delete: {
    name: 'crm_ticket_delete',
    method: 'delete',
    path: 'crm/tickets/delete',
  },
  crm_ticket_create: {
    name: 'crm_ticket_create',
    method: 'post',
    path: 'crm/tickets/create',
  },
  crm_ticket_update: {
    name: 'crm_ticket_update',
    method: 'post',
    path: 'crm/tickets/update',
  },
  crm_inbox_message: {
    name: 'crm_inbox_message',
    method: 'get',
    path: 'crm/inbox/message',
  },
  crm_inbox_messages: {
    name: 'crm_inbox_messages',
    method: 'get',
    path: 'crm/inbox/messages',
  },
  crm_inbox_conversation_messages: {
    name: 'crm_inbox_conversation_messages',
    method: 'get',
    path: 'crm/inbox/conversation/messages',
  },
  crm_inbox_conversations: {
    name: 'crm_inbox_conversations',
    method: 'get',
    path: 'crm/inbox/conversations',
  },
  crm_inbox_delete: {
    name: 'crm_inbox_delete',
    method: 'delete',
    path: 'crm/inbox/delete',
  },
  crm_inbox_update: {
    name: 'crm_inbox_update',
    method: 'post',
    path: 'crm/inbox/update',
  },
  crm_reservations_by_email: {
    name: 'crm_reservations_by_email',
    method: 'get',
    path: 'crm/reservations/by-email',
  },
  crm_reservations_get: {
    name: 'crm_reservations_get',
    method: 'get',
    path: 'crm/reservations/get',
  },
  crm_reservations_delete: {
    name: 'crm_reservations_delete',
    method: 'delete',
    path: 'crm/reservations/delete',
  },
  crm_reservations_create: {
    name: 'crm_reservations_create',
    method: 'post',
    path: 'crm/reservations/create',
  },
  crm_reservations_update: {
    name: 'crm_reservations_update',
    method: 'post',
    path: 'crm/reservations/update',
  },
  crm_reservations_definitions: {
    name: 'crm_reservations_definitions',
    method: 'get',
    path: 'crm/reservations/definitions',
  },
  crm_reservations_slots: {
    name: 'crm_reservations_slots',
    method: 'post',
    path: 'crm/reservations/slots',
  },
  crm_service_request_queue_join: {
    name: 'crm_service_request_queue_join',
    method: 'post',
    path: 'crm/service-request-queue/join',
  },
  crm_service_request_update: {
    name: 'crm_service_request_update',
    method: 'post',
    path: 'crm/service-request/update',
  },
  crm_service_request_get: {
    name: 'crm_service_request_get',
    method: 'get',
    path: 'crm/service-request/get',
  },
  crm_contact_form_post: {
    name: 'crm_contact_form_post',
    method: 'post',
    path: 'crm/contact-form/post',
  },
  crm_contact_form_json: {
    name: 'crm_contact_form_json',
    method: 'post',
    path: 'crm/contact-form/json',
  },
  crm_promotion_unsubscribe: {
    name: 'crm_promotion_unsubscribe',
    method: 'post',
    path: 'crm/promotion/unsubscribe',
  },
  crm_events_get: {
    name: 'crm_events_get',
    method: 'get',
    path: 'crm/events/get',
  },
  crm_events_delete: {
    name: 'crm_events_delete',
    method: 'delete',
    path: 'crm/events/delete',
  },
  crm_events_create: {
    name: 'crm_events_create',
    method: 'post',
    path: 'crm/events/create',
  },
  crm_events_update: {
    name: 'crm_events_update',
    method: 'post',
    path: 'crm/events/update',
  },
  crm_flexdata_get: {
    name: 'crm_flexdata_get',
    method: 'get',
    path: 'crm/flexdata/get',
  },
  crm_flexdata_delete: {
    name: 'crm_flexdata_delete',
    method: 'delete',
    path: 'crm/flexdata/delete',
  },
  crm_flexdata_create: {
    name: 'crm_flexdata_create',
    method: 'post',
    path: 'crm/flexdata/create',
  },
  crm_flexdata_update: {
    name: 'crm_flexdata_update',
    method: 'post',
    path: 'crm/flexdata/update',
  },
  crm_comment_delete: {
    name: 'crm_comment_delete',
    method: 'delete',
    path: 'crm/comment/delete',
  },
  crm_comment_create: {
    name: 'crm_comment_create',
    method: 'post',
    path: 'crm/comment/create',
  },
  crm_comment_get: {
    name: 'crm_comment_get',
    method: 'get',
    path: 'crm/comment/get',
  },
  crm_activity_manage: {
    name: 'crm_activity_manage',
    method: 'post',
    path: 'crm/activity/manage',
  },
  crm_activity_by_customer: {
    name: 'crm_activity_by_customer',
    method: 'get',
    path: 'crm/activity/by-customer',
  },
  crm_activity_by_resource: {
    name: 'crm_activity_by_resource',
    method: 'get',
    path: 'crm/activity/by-resource',
  },
  index_site: {
    name: 'index_site',
    method: 'get',
    path: 'tools/index-site',
  },
  web_visit: {
    name: 'web_visit',
    method: 'post',
    path: 'tools/web-visit',
  },
  web_activity: {
    name: 'web_activity',
    method: 'post',
    path: 'tools/web-activity',
  },
  aggregate: {
    name: 'aggregate',
    method: 'post',
    path: 'repository/aggregate',
  },
  'dynamic_query': {
    name: 'dynamic_query',
    method: 'post',
    path: 'dynamic-query/query',
  },
  'dynamic_update': {
    name: 'dynamic_update',
    method: 'post',
    path: 'dynamic-query/update',
  },
  'site_page_data': {
    name: 'site_page_data',
    method: 'get',
    path: 'site/page-data',
  },
  'checkout_apply_coupon': {
    name: 'checkout_apply_coupon',
    method: 'post',
    path: 'storefront/apply-coupon'
  }
}