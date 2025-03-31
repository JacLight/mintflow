import { createPipedriveClient } from './client.js';
import { Field, PipedriveAuth } from './models.js';

/**
 * Pipedrive plugin for MintFlow
 * 
 * This plugin provides integration with Pipedrive CRM, allowing you to manage persons, organizations, deals, leads, activities, and more.
 */
export default {
    name: 'pipedrive',
    version: '1.0.0',

    /**
     * Initialize the plugin with the provided configuration
     */
    init: async (config: PipedriveAuth) => {
        if (!config.access_token) {
            throw new Error('API token is required for Pipedrive plugin');
        }

        if (!config.data || !config.data.api_domain) {
            throw new Error('API domain is required for Pipedrive plugin');
        }

        return {
            client: createPipedriveClient(config),
        };
    },

    // Person actions

    /**
     * List all persons
     */
    list_persons: async ({ client }, params = {}) => {
        const response = await client.listPersons(params);
        return response.data;
    },

    /**
     * Get a specific person by ID
     */
    get_person: async ({ client }, { id }) => {
        const response = await client.getPerson(id);
        return response.data;
    },

    /**
     * Create a new person
     */
    create_person: async ({ client }, data) => {
        const { name, owner_id, org_id, marketing_status, visible_to, first_name, last_name, email, phone, label_ids, ...customFields } = data;

        const personDefaultFields: Record<string, any> = {
            name,
            owner_id,
            org_id,
            marketing_status,
            visible_to,
            first_name,
            last_name,
        };

        if (phone && phone.length > 0) {
            personDefaultFields.phone = phone;
        }

        if (email && email.length > 0) {
            personDefaultFields.email = email;
        }

        if (label_ids && label_ids.length > 0) {
            personDefaultFields.label_ids = label_ids;
        }

        const personCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            personCustomFields[key] = Array.isArray(value) ? value.join(',') : String(value);
        });

        const response = await client.createPerson({
            ...personDefaultFields,
            ...personCustomFields,
        });

        // Get person fields to transform custom fields
        const customFieldsResponse = await client.getPersonFields();

        // Transform custom fields in response
        const updatedPersonProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedPersonProperties,
        };
    },

    /**
     * Update an existing person
     */
    update_person: async ({ client }, { id, ...data }) => {
        const { name, owner_id, org_id, marketing_status, visible_to, first_name, last_name, email, phone, label_ids, ...customFields } = data;

        const personDefaultFields: Record<string, any> = {};

        if (name) personDefaultFields.name = name;
        if (owner_id) personDefaultFields.owner_id = owner_id;
        if (org_id) personDefaultFields.org_id = org_id;
        if (marketing_status) personDefaultFields.marketing_status = marketing_status;
        if (visible_to) personDefaultFields.visible_to = visible_to;
        if (first_name) personDefaultFields.first_name = first_name;
        if (last_name) personDefaultFields.last_name = last_name;

        if (phone && phone.length > 0) {
            personDefaultFields.phone = phone;
        }

        if (email && email.length > 0) {
            personDefaultFields.email = email;
        }

        if (label_ids && label_ids.length > 0) {
            personDefaultFields.label_ids = label_ids;
        }

        const personCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            personCustomFields[key] = Array.isArray(value) ? value.join(',') : value;
        });

        const response = await client.updatePerson(id, {
            ...personDefaultFields,
            ...personCustomFields,
        });

        // Get person fields to transform custom fields
        const customFieldsResponse = await client.getPersonFields();

        // Transform custom fields in response
        const updatedPersonProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedPersonProperties,
        };
    },

    /**
     * Find persons by search criteria
     */
    find_person: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findPersons(params);
        return response.data;
    },

    // Organization actions

    /**
     * List all organizations
     */
    list_organizations: async ({ client }, params = {}) => {
        const response = await client.listOrganizations(params);
        return response.data;
    },

    /**
     * Get a specific organization by ID
     */
    get_organization: async ({ client }, { id }) => {
        const response = await client.getOrganization(id);
        return response.data;
    },

    /**
     * Create a new organization
     */
    create_organization: async ({ client }, data) => {
        const { name, owner_id, visible_to, label_ids, address, ...customFields } = data;

        const orgDefaultFields: Record<string, any> = {
            name,
            owner_id,
            visible_to,
            address,
        };

        if (label_ids && label_ids.length > 0) {
            orgDefaultFields.label_ids = label_ids;
        }

        const orgCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            orgCustomFields[key] = Array.isArray(value) ? value.join(',') : String(value);
        });

        const response = await client.createOrganization({
            ...orgDefaultFields,
            ...orgCustomFields,
        });

        // Get organization fields to transform custom fields
        const customFieldsResponse = await client.getOrganizationFields();

        // Transform custom fields in response
        const updatedOrgProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedOrgProperties,
        };
    },

    /**
     * Update an existing organization
     */
    update_organization: async ({ client }, { id, ...data }) => {
        const { name, owner_id, visible_to, label_ids, address, ...customFields } = data;

        const orgDefaultFields: Record<string, any> = {};

        if (name) orgDefaultFields.name = name;
        if (owner_id) orgDefaultFields.owner_id = owner_id;
        if (visible_to) orgDefaultFields.visible_to = visible_to;
        if (address) orgDefaultFields.address = address;

        if (label_ids && label_ids.length > 0) {
            orgDefaultFields.label_ids = label_ids;
        }

        const orgCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            orgCustomFields[key] = Array.isArray(value) ? value.join(',') : value;
        });

        const response = await client.updateOrganization(id, {
            ...orgDefaultFields,
            ...orgCustomFields,
        });

        // Get organization fields to transform custom fields
        const customFieldsResponse = await client.getOrganizationFields();

        // Transform custom fields in response
        const updatedOrgProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedOrgProperties,
        };
    },

    /**
     * Find organizations by search criteria
     */
    find_organization: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findOrganizations(params);
        return response.data;
    },

    // Deal actions

    /**
     * List all deals
     */
    list_deals: async ({ client }, params = {}) => {
        const response = await client.listDeals(params);
        return response.data;
    },

    /**
     * Get a specific deal by ID
     */
    get_deal: async ({ client }, { id }) => {
        const response = await client.getDeal(id);
        return response.data;
    },

    /**
     * Create a new deal
     */
    create_deal: async ({ client }, data) => {
        const { title, value, currency, status, stage_id, pipeline_id, owner_id, org_id, person_id, visible_to, label_ids, probability, expected_close_date, ...customFields } = data;

        const dealDefaultFields: Record<string, any> = {
            title,
            status,
            stage_id,
            pipeline_id,
            owner_id,
            org_id,
            person_id,
            visible_to,
            probability,
            expected_close_date,
        };

        if (value) {
            dealDefaultFields.value = value;
            if (currency) dealDefaultFields.currency = currency;
        }

        if (label_ids && label_ids.length > 0) {
            dealDefaultFields.label_ids = label_ids;
        }

        const dealCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            dealCustomFields[key] = Array.isArray(value) ? value.join(',') : String(value);
        });

        const response = await client.createDeal({
            ...dealDefaultFields,
            ...dealCustomFields,
        });

        // Get deal fields to transform custom fields
        const customFieldsResponse = await client.getDealFields();

        // Transform custom fields in response
        const updatedDealProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedDealProperties,
        };
    },

    /**
     * Update an existing deal
     */
    update_deal: async ({ client }, { id, ...data }) => {
        const { title, value, currency, status, stage_id, pipeline_id, owner_id, org_id, person_id, visible_to, label_ids, probability, expected_close_date, ...customFields } = data;

        const dealDefaultFields: Record<string, any> = {};

        if (title) dealDefaultFields.title = title;
        if (status) dealDefaultFields.status = status;
        if (stage_id) dealDefaultFields.stage_id = stage_id;
        if (pipeline_id) dealDefaultFields.pipeline_id = pipeline_id;
        if (owner_id) dealDefaultFields.owner_id = owner_id;
        if (org_id) dealDefaultFields.org_id = org_id;
        if (person_id) dealDefaultFields.person_id = person_id;
        if (visible_to) dealDefaultFields.visible_to = visible_to;
        if (probability) dealDefaultFields.probability = probability;
        if (expected_close_date) dealDefaultFields.expected_close_date = expected_close_date;

        if (value) {
            dealDefaultFields.value = value;
            if (currency) dealDefaultFields.currency = currency;
        }

        if (label_ids && label_ids.length > 0) {
            dealDefaultFields.label_ids = label_ids;
        }

        const dealCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            dealCustomFields[key] = Array.isArray(value) ? value.join(',') : value;
        });

        const response = await client.updateDeal(id, {
            ...dealDefaultFields,
            ...dealCustomFields,
        });

        // Get deal fields to transform custom fields
        const customFieldsResponse = await client.getDealFields();

        // Transform custom fields in response
        const updatedDealProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedDealProperties,
        };
    },

    /**
     * Find deals by search criteria
     */
    find_deal: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findDeals(params);
        return response.data;
    },

    /**
     * Find deals associated with a person
     */
    find_deals_associated_with_person: async ({ client }, { personId }) => {
        const response = await client.getDealsForPerson(personId);
        return response.data;
    },

    // Lead actions

    /**
     * List all leads
     */
    list_leads: async ({ client }, params = {}) => {
        const response = await client.listLeads(params);
        return response.data;
    },

    /**
     * Get a specific lead by ID
     */
    get_lead: async ({ client }, { id }) => {
        const response = await client.getLead(id);
        return response.data;
    },

    /**
     * Create a new lead
     */
    create_lead: async ({ client }, data) => {
        const { title, owner_id, person_id, organization_id, label_ids, value, currency, expected_close_date, visible_to, ...customFields } = data;

        const leadDefaultFields: Record<string, any> = {
            title,
            owner_id,
            person_id,
            organization_id,
            expected_close_date,
            visible_to,
        };

        if (value) {
            leadDefaultFields.value = value;
            if (currency) leadDefaultFields.currency = currency;
        }

        if (label_ids && label_ids.length > 0) {
            leadDefaultFields.label_ids = label_ids;
        }

        const leadCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            leadCustomFields[key] = Array.isArray(value) ? value.join(',') : String(value);
        });

        const response = await client.createLead({
            ...leadDefaultFields,
            ...leadCustomFields,
        });

        // Get deal fields to transform custom fields (leads use deal fields)
        const customFieldsResponse = await client.getDealFields();

        // Transform custom fields in response
        const updatedLeadProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedLeadProperties,
        };
    },

    /**
     * Update an existing lead
     */
    update_lead: async ({ client }, { id, ...data }) => {
        const { title, owner_id, person_id, organization_id, label_ids, value, currency, expected_close_date, visible_to, ...customFields } = data;

        const leadDefaultFields: Record<string, any> = {};

        if (title) leadDefaultFields.title = title;
        if (owner_id) leadDefaultFields.owner_id = owner_id;
        if (person_id) leadDefaultFields.person_id = person_id;
        if (organization_id) leadDefaultFields.organization_id = organization_id;
        if (expected_close_date) leadDefaultFields.expected_close_date = expected_close_date;
        if (visible_to) leadDefaultFields.visible_to = visible_to;

        if (value) {
            leadDefaultFields.value = value;
            if (currency) leadDefaultFields.currency = currency;
        }

        if (label_ids && label_ids.length > 0) {
            leadDefaultFields.label_ids = label_ids;
        }

        const leadCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            leadCustomFields[key] = Array.isArray(value) ? value.join(',') : value;
        });

        const response = await client.updateLead(id, {
            ...leadDefaultFields,
            ...leadCustomFields,
        });

        // Get deal fields to transform custom fields (leads use deal fields)
        const customFieldsResponse = await client.getDealFields();

        // Transform custom fields in response
        const updatedLeadProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedLeadProperties,
        };
    },

    // Activity actions

    /**
     * List all activities
     */
    list_activities: async ({ client }, params = {}) => {
        const response = await client.listActivities(params);
        return response.data;
    },

    /**
     * Get a specific activity by ID
     */
    get_activity: async ({ client }, { id }) => {
        const response = await client.getActivity(id);
        return response.data;
    },

    /**
     * Create a new activity
     */
    create_activity: async ({ client }, data) => {
        const { subject, type, due_date, due_time, duration, org_id, person_id, deal_id, lead_id, assigned_to_user_id, done, busy_flag, note, public_description } = data;

        const activityData: Record<string, any> = {
            subject,
            type,
            due_date,
            due_time,
            duration,
            org_id,
            person_id,
            deal_id,
            lead_id,
            assigned_to_user_id,
            note,
            public_description,
        };

        if (done !== undefined) activityData.done = done ? 1 : 0;
        if (busy_flag !== undefined) activityData.busy_flag = busy_flag;

        const response = await client.createActivity(activityData);
        return response.data;
    },

    /**
     * Update an existing activity
     */
    update_activity: async ({ client }, { id, ...data }) => {
        const { subject, type, due_date, due_time, duration, org_id, person_id, deal_id, lead_id, assigned_to_user_id, done, busy_flag, note, public_description } = data;

        const activityData: Record<string, any> = {};

        if (subject) activityData.subject = subject;
        if (type) activityData.type = type;
        if (due_date) activityData.due_date = due_date;
        if (due_time) activityData.due_time = due_time;
        if (duration) activityData.duration = duration;
        if (org_id) activityData.org_id = org_id;
        if (person_id) activityData.person_id = person_id;
        if (deal_id) activityData.deal_id = deal_id;
        if (lead_id) activityData.lead_id = lead_id;
        if (assigned_to_user_id) activityData.assigned_to_user_id = assigned_to_user_id;
        if (note) activityData.note = note;
        if (public_description) activityData.public_description = public_description;

        if (done !== undefined) activityData.done = done ? 1 : 0;
        if (busy_flag !== undefined) activityData.busy_flag = busy_flag;

        const response = await client.updateActivity(id, activityData);
        return response.data;
    },

    /**
     * Find activities by search criteria
     */
    find_activity: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findActivities(params);
        return response.data;
    },

    // Product actions

    /**
     * List all products
     */
    list_products: async ({ client }, params = {}) => {
        const response = await client.listProducts(params);
        return response.data;
    },

    /**
     * Get a specific product by ID
     */
    get_product: async ({ client }, { id }) => {
        const response = await client.getProduct(id);
        return response.data;
    },

    /**
     * Create a new product
     */
    create_product: async ({ client }, data) => {
        const { name, code, unit, tax, active_flag, visible_to, owner_id, prices, ...customFields } = data;

        const productDefaultFields: Record<string, any> = {
            name,
            code,
            unit,
            tax,
            active_flag,
            visible_to,
            owner_id,
            prices,
        };

        const productCustomFields: Record<string, string> = {};

        Object.entries(customFields).forEach(([key, value]) => {
            // Format values if they are arrays
            productCustomFields[key] = Array.isArray(value) ? value.join(',') : String(value);
        });

        const response = await client.createProduct({
            ...productDefaultFields,
            ...productCustomFields,
        });

        // Get product fields to transform custom fields
        const customFieldsResponse = await client.getProductFields();

        // Transform custom fields in response
        const updatedProductProperties = client.transformCustomFields(
            customFieldsResponse,
            response.data,
        );

        return {
            ...response,
            data: updatedProductProperties,
        };
    },

    /**
     * Find products by search criteria
     */
    find_product: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findProducts(params);
        return response.data;
    },

    /**
     * Add a product to a deal
     */
    add_product_to_deal: async ({ client }, { dealId, productId, item_price, quantity, discount_percentage, duration, product_variation_id, comments, enabled_flag }) => {
        const data: Record<string, any> = {};

        if (item_price !== undefined) data.item_price = item_price;
        if (quantity !== undefined) data.quantity = quantity;
        if (discount_percentage !== undefined) data.discount_percentage = discount_percentage;
        if (duration !== undefined) data.duration = duration;
        if (product_variation_id !== undefined) data.product_variation_id = product_variation_id;
        if (comments !== undefined) data.comments = comments;
        if (enabled_flag !== undefined) data.enabled_flag = enabled_flag;

        const response = await client.addProductToDeal(dealId, productId, data);
        return response.data;
    },

    // Note actions

    /**
     * List all notes
     */
    list_notes: async ({ client }, params = {}) => {
        const response = await client.listNotes(params);
        return response.data;
    },

    /**
     * Get a specific note by ID
     */
    get_note: async ({ client }, { id }) => {
        const response = await client.getNote(id);
        return response.data;
    },

    /**
     * Create a new note
     */
    create_note: async ({ client }, { content, deal_id, person_id, org_id, lead_id, pinned_to_deal_flag, pinned_to_person_flag, pinned_to_organization_flag, pinned_to_lead_flag }) => {
        const noteData: Record<string, any> = {
            content,
            deal_id,
            person_id,
            org_id,
            lead_id,
        };

        if (pinned_to_deal_flag !== undefined) noteData.pinned_to_deal_flag = pinned_to_deal_flag;
        if (pinned_to_person_flag !== undefined) noteData.pinned_to_person_flag = pinned_to_person_flag;
        if (pinned_to_organization_flag !== undefined) noteData.pinned_to_organization_flag = pinned_to_organization_flag;
        if (pinned_to_lead_flag !== undefined) noteData.pinned_to_lead_flag = pinned_to_lead_flag;

        const response = await client.createNote(noteData);
        return response.data;
    },

    /**
     * Find notes by search criteria
     */
    find_notes: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findNotes(params);
        return response.data;
    },

    // User actions

    /**
     * List all users
     */
    list_users: async ({ client }) => {
        const response = await client.listUsers();
        return response.data;
    },

    /**
     * Get a specific user by ID
     */
    get_user: async ({ client }, { id }) => {
        const response = await client.getUser(id);
        return response.data;
    },

    /**
     * Find users by search criteria
     */
    find_user: async ({ client }, { term, fields, exact_match, start, limit }) => {
        const params: Record<string, any> = {};

        if (term) params.term = term;
        if (fields) params.fields = fields;
        if (exact_match !== undefined) params.exact_match = exact_match;
        if (start !== undefined) params.start = start;
        if (limit !== undefined) params.limit = limit;

        const response = await client.findUser(params);
        return response.data;
    },

    // Follower actions

    /**
     * Add a follower to a deal, person, organization, or lead
     */
    add_follower: async ({ client }, { user_id, deal_id, person_id, org_id, lead_id }) => {
        const followerData: Record<string, any> = {
            user_id,
        };

        if (deal_id) followerData.deal_id = deal_id;
        if (person_id) followerData.person_id = person_id;
        if (org_id) followerData.org_id = org_id;
        if (lead_id) followerData.lead_id = lead_id;

        const response = await client.addFollower(followerData);
        return response.data;
    },

    // Webhook actions

    /**
     * Create a webhook
     */
    create_webhook: async ({ client }, { object, action, webhookUrl }) => {
        const response = await client.createWebhook(object, action, webhookUrl);
        return response.data;
    },

    /**
     * Delete a webhook
     */
    delete_webhook: async ({ client }, { webhookId }) => {
        const response = await client.deleteWebhook(webhookId);
        return response.data;
    },

    // Utility actions

    /**
     * List all pipelines
     */
    list_pipelines: async ({ client }) => {
        const response = await client.listPipelines();
        return response.data;
    },

    /**
     * List all stages
     */
    list_stages: async ({ client }) => {
        const response = await client.listStages();
        return response;
    },

    /**
     * List all filters of a specific type
     */
    list_filters: async ({ client }, { type }) => {
        const response = await client.listFilters(type);
        return response.data;
    },

    /**
     * List all activity types
     */
    list_activity_types: async ({ client }) => {
        const response = await client.listActivityTypes();
        return response.data;
    },

    /**
     * List all lead labels
     */
    list_lead_labels: async ({ client }) => {
        const response = await client.listLeadLabels();
        return response.data;
    },
};

// Export types
export * from './models.js';
