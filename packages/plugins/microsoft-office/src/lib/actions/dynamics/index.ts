import { initGraphClient, handleGraphError } from '../../common/index.js';
import {
    DynamicsListContactsParams,
    DynamicsGetContactParams,
    DynamicsCreateContactParams,
    DynamicsUpdateContactParams,
    DynamicsDeleteContactParams,
    DynamicsListAccountsParams,
    DynamicsGetAccountParams,
    DynamicsCreateAccountParams,
    DynamicsUpdateAccountParams,
    DynamicsDeleteAccountParams,
    DynamicsListOpportunitiesParams,
    DynamicsGetOpportunityParams,
    DynamicsCreateOpportunityParams,
    DynamicsUpdateOpportunityParams,
    DynamicsDeleteOpportunityParams,
    DynamicsContact,
    DynamicsAccount,
    DynamicsOpportunity
} from '../../models/dynamics.js';

// Dynamics CRM API base URL
const DYNAMICS_API_BASE = '/api/data/v9.2';

/**
 * List contacts
 */
export const listContacts = async (params: DynamicsListContactsParams): Promise<DynamicsContact[]> => {
    try {
        const { token, filter, top } = params;
        const client = initGraphClient(token);

        // Build query parameters
        let queryParams = '';
        if (filter) {
            queryParams += `$filter=${encodeURIComponent(filter)}`;
        }
        if (top) {
            queryParams += queryParams ? '&' : '';
            queryParams += `$top=${top}`;
        }
        if (queryParams) {
            queryParams = `?${queryParams}`;
        }

        // Get contacts
        const response = await client.api(`${DYNAMICS_API_BASE}/contacts${queryParams}`)
            .get();

        return response.value.map((contact: any) => ({
            id: contact.contactid,
            firstName: contact.firstname,
            lastName: contact.lastname,
            email: contact.emailaddress1,
            phone: contact.telephone1,
            company: contact._parentcustomerid_value,
            jobTitle: contact.jobtitle,
            address: {
                street: contact.address1_line1,
                city: contact.address1_city,
                state: contact.address1_stateorprovince,
                postalCode: contact.address1_postalcode,
                country: contact.address1_country
            }
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get a contact by ID
 */
export const getContact = async (params: DynamicsGetContactParams): Promise<DynamicsContact> => {
    try {
        const { token, contactId } = params;
        const client = initGraphClient(token);

        // Get contact
        const contact = await client.api(`${DYNAMICS_API_BASE}/contacts(${contactId})`)
            .get();

        return {
            id: contact.contactid,
            firstName: contact.firstname,
            lastName: contact.lastname,
            email: contact.emailaddress1,
            phone: contact.telephone1,
            company: contact._parentcustomerid_value,
            jobTitle: contact.jobtitle,
            address: {
                street: contact.address1_line1,
                city: contact.address1_city,
                state: contact.address1_stateorprovince,
                postalCode: contact.address1_postalcode,
                country: contact.address1_country
            }
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Create a contact
 */
export const createContact = async (params: DynamicsCreateContactParams): Promise<DynamicsContact> => {
    try {
        const { token, firstName, lastName, email, phone, company, jobTitle, address } = params;
        const client = initGraphClient(token);

        // Create contact object
        const contactData: any = {
            firstname: firstName,
            lastname: lastName
        };

        if (email) contactData.emailaddress1 = email;
        if (phone) contactData.telephone1 = phone;
        if (company) contactData._parentcustomerid_value = company;
        if (jobTitle) contactData.jobtitle = jobTitle;

        if (address) {
            if (address.street) contactData.address1_line1 = address.street;
            if (address.city) contactData.address1_city = address.city;
            if (address.state) contactData.address1_stateorprovince = address.state;
            if (address.postalCode) contactData.address1_postalcode = address.postalCode;
            if (address.country) contactData.address1_country = address.country;
        }

        // Create contact
        const contact = await client.api(`${DYNAMICS_API_BASE}/contacts`)
            .post(contactData);

        return {
            id: contact.contactid,
            firstName: contact.firstname,
            lastName: contact.lastname,
            email: contact.emailaddress1,
            phone: contact.telephone1,
            company: contact._parentcustomerid_value,
            jobTitle: contact.jobtitle,
            address: {
                street: contact.address1_line1,
                city: contact.address1_city,
                state: contact.address1_stateorprovince,
                postalCode: contact.address1_postalcode,
                country: contact.address1_country
            }
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Update a contact
 */
export const updateContact = async (params: DynamicsUpdateContactParams): Promise<DynamicsContact> => {
    try {
        const { token, contactId, firstName, lastName, email, phone, company, jobTitle, address } = params;
        const client = initGraphClient(token);

        // Create update object with only the fields that are provided
        const updateData: any = {};

        if (firstName) updateData.firstname = firstName;
        if (lastName) updateData.lastname = lastName;
        if (email) updateData.emailaddress1 = email;
        if (phone) updateData.telephone1 = phone;
        if (company) updateData._parentcustomerid_value = company;
        if (jobTitle) updateData.jobtitle = jobTitle;

        if (address) {
            if (address.street) updateData.address1_line1 = address.street;
            if (address.city) updateData.address1_city = address.city;
            if (address.state) updateData.address1_stateorprovince = address.state;
            if (address.postalCode) updateData.address1_postalcode = address.postalCode;
            if (address.country) updateData.address1_country = address.country;
        }

        // Update contact
        await client.api(`${DYNAMICS_API_BASE}/contacts(${contactId})`)
            .patch(updateData);

        // Get updated contact
        return await getContact({ token, contactId });
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Delete a contact
 */
export const deleteContact = async (params: DynamicsDeleteContactParams): Promise<void> => {
    try {
        const { token, contactId } = params;
        const client = initGraphClient(token);

        // Delete contact
        await client.api(`${DYNAMICS_API_BASE}/contacts(${contactId})`)
            .delete();
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * List accounts
 */
export const listAccounts = async (params: DynamicsListAccountsParams): Promise<DynamicsAccount[]> => {
    try {
        const { token, filter, top } = params;
        const client = initGraphClient(token);

        // Build query parameters
        let queryParams = '';
        if (filter) {
            queryParams += `$filter=${encodeURIComponent(filter)}`;
        }
        if (top) {
            queryParams += queryParams ? '&' : '';
            queryParams += `$top=${top}`;
        }
        if (queryParams) {
            queryParams = `?${queryParams}`;
        }

        // Get accounts
        const response = await client.api(`${DYNAMICS_API_BASE}/accounts${queryParams}`)
            .get();

        return response.value.map((account: any) => ({
            id: account.accountid,
            name: account.name,
            email: account.emailaddress1,
            phone: account.telephone1,
            website: account.websiteurl,
            industry: account.industrycode,
            revenue: account.revenue,
            address: {
                street: account.address1_line1,
                city: account.address1_city,
                state: account.address1_stateorprovince,
                postalCode: account.address1_postalcode,
                country: account.address1_country
            }
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get an account by ID
 */
export const getAccount = async (params: DynamicsGetAccountParams): Promise<DynamicsAccount> => {
    try {
        const { token, accountId } = params;
        const client = initGraphClient(token);

        // Get account
        const account = await client.api(`${DYNAMICS_API_BASE}/accounts(${accountId})`)
            .get();

        return {
            id: account.accountid,
            name: account.name,
            email: account.emailaddress1,
            phone: account.telephone1,
            website: account.websiteurl,
            industry: account.industrycode,
            revenue: account.revenue,
            address: {
                street: account.address1_line1,
                city: account.address1_city,
                state: account.address1_stateorprovince,
                postalCode: account.address1_postalcode,
                country: account.address1_country
            }
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Create an account
 */
export const createAccount = async (params: DynamicsCreateAccountParams): Promise<DynamicsAccount> => {
    try {
        const { token, name, email, phone, website, industry, revenue, address } = params;
        const client = initGraphClient(token);

        // Create account object
        const accountData: any = {
            name
        };

        if (email) accountData.emailaddress1 = email;
        if (phone) accountData.telephone1 = phone;
        if (website) accountData.websiteurl = website;
        if (industry) accountData.industrycode = industry;
        if (revenue) accountData.revenue = revenue;

        if (address) {
            if (address.street) accountData.address1_line1 = address.street;
            if (address.city) accountData.address1_city = address.city;
            if (address.state) accountData.address1_stateorprovince = address.state;
            if (address.postalCode) accountData.address1_postalcode = address.postalCode;
            if (address.country) accountData.address1_country = address.country;
        }

        // Create account
        const account = await client.api(`${DYNAMICS_API_BASE}/accounts`)
            .post(accountData);

        return {
            id: account.accountid,
            name: account.name,
            email: account.emailaddress1,
            phone: account.telephone1,
            website: account.websiteurl,
            industry: account.industrycode,
            revenue: account.revenue,
            address: {
                street: account.address1_line1,
                city: account.address1_city,
                state: account.address1_stateorprovince,
                postalCode: account.address1_postalcode,
                country: account.address1_country
            }
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Update an account
 */
export const updateAccount = async (params: DynamicsUpdateAccountParams): Promise<DynamicsAccount> => {
    try {
        const { token, accountId, name, email, phone, website, industry, revenue, address } = params;
        const client = initGraphClient(token);

        // Create update object with only the fields that are provided
        const updateData: any = {};

        if (name) updateData.name = name;
        if (email) updateData.emailaddress1 = email;
        if (phone) updateData.telephone1 = phone;
        if (website) updateData.websiteurl = website;
        if (industry) updateData.industrycode = industry;
        if (revenue) updateData.revenue = revenue;

        if (address) {
            if (address.street) updateData.address1_line1 = address.street;
            if (address.city) updateData.address1_city = address.city;
            if (address.state) updateData.address1_stateorprovince = address.state;
            if (address.postalCode) updateData.address1_postalcode = address.postalCode;
            if (address.country) updateData.address1_country = address.country;
        }

        // Update account
        await client.api(`${DYNAMICS_API_BASE}/accounts(${accountId})`)
            .patch(updateData);

        // Get updated account
        return await getAccount({ token, accountId });
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Delete an account
 */
export const deleteAccount = async (params: DynamicsDeleteAccountParams): Promise<void> => {
    try {
        const { token, accountId } = params;
        const client = initGraphClient(token);

        // Delete account
        await client.api(`${DYNAMICS_API_BASE}/accounts(${accountId})`)
            .delete();
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * List opportunities
 */
export const listOpportunities = async (params: DynamicsListOpportunitiesParams): Promise<DynamicsOpportunity[]> => {
    try {
        const { token, filter, top } = params;
        const client = initGraphClient(token);

        // Build query parameters
        let queryParams = '';
        if (filter) {
            queryParams += `$filter=${encodeURIComponent(filter)}`;
        }
        if (top) {
            queryParams += queryParams ? '&' : '';
            queryParams += `$top=${top}`;
        }
        if (queryParams) {
            queryParams = `?${queryParams}`;
        }

        // Get opportunities
        const response = await client.api(`${DYNAMICS_API_BASE}/opportunities${queryParams}`)
            .get();

        return response.value.map((opportunity: any) => ({
            id: opportunity.opportunityid,
            name: opportunity.name,
            customerId: opportunity._customerid_value,
            estimatedValue: opportunity.estimatedvalue,
            estimatedCloseDate: opportunity.estimatedclosedate,
            description: opportunity.description,
            probability: opportunity.closeprobability,
            status: opportunity.statecode,
            statusReason: opportunity.statuscode
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get an opportunity by ID
 */
export const getOpportunity = async (params: DynamicsGetOpportunityParams): Promise<DynamicsOpportunity> => {
    try {
        const { token, opportunityId } = params;
        const client = initGraphClient(token);

        // Get opportunity
        const opportunity = await client.api(`${DYNAMICS_API_BASE}/opportunities(${opportunityId})`)
            .get();

        return {
            id: opportunity.opportunityid,
            name: opportunity.name,
            customerId: opportunity._customerid_value,
            estimatedValue: opportunity.estimatedvalue,
            estimatedCloseDate: opportunity.estimatedclosedate,
            description: opportunity.description,
            probability: opportunity.closeprobability,
            status: opportunity.statecode,
            statusReason: opportunity.statuscode
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Create an opportunity
 */
export const createOpportunity = async (params: DynamicsCreateOpportunityParams): Promise<DynamicsOpportunity> => {
    try {
        const { token, name, customerId, estimatedValue, estimatedCloseDate, description, probability } = params;
        const client = initGraphClient(token);

        // Create opportunity object
        const opportunityData: any = {
            name,
            _customerid_value: customerId
        };

        if (estimatedValue) opportunityData.estimatedvalue = estimatedValue;
        if (estimatedCloseDate) opportunityData.estimatedclosedate = estimatedCloseDate;
        if (description) opportunityData.description = description;
        if (probability) opportunityData.closeprobability = probability;

        // Create opportunity
        const opportunity = await client.api(`${DYNAMICS_API_BASE}/opportunities`)
            .post(opportunityData);

        return {
            id: opportunity.opportunityid,
            name: opportunity.name,
            customerId: opportunity._customerid_value,
            estimatedValue: opportunity.estimatedvalue,
            estimatedCloseDate: opportunity.estimatedclosedate,
            description: opportunity.description,
            probability: opportunity.closeprobability,
            status: opportunity.statecode,
            statusReason: opportunity.statuscode
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Update an opportunity
 */
export const updateOpportunity = async (params: DynamicsUpdateOpportunityParams): Promise<DynamicsOpportunity> => {
    try {
        const { token, opportunityId, name, customerId, estimatedValue, estimatedCloseDate, description, probability, status, statusReason } = params;
        const client = initGraphClient(token);

        // Create update object with only the fields that are provided
        const updateData: any = {};

        if (name) updateData.name = name;
        if (customerId) updateData._customerid_value = customerId;
        if (estimatedValue) updateData.estimatedvalue = estimatedValue;
        if (estimatedCloseDate) updateData.estimatedclosedate = estimatedCloseDate;
        if (description) updateData.description = description;
        if (probability) updateData.closeprobability = probability;
        if (status !== undefined) updateData.statecode = status;
        if (statusReason !== undefined) updateData.statuscode = statusReason;

        // Update opportunity
        await client.api(`${DYNAMICS_API_BASE}/opportunities(${opportunityId})`)
            .patch(updateData);

        // Get updated opportunity
        return await getOpportunity({ token, opportunityId });
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (params: DynamicsDeleteOpportunityParams): Promise<void> => {
    try {
        const { token, opportunityId } = params;
        const client = initGraphClient(token);

        // Delete opportunity
        await client.api(`${DYNAMICS_API_BASE}/opportunities(${opportunityId})`)
            .delete();
    } catch (error) {
        throw handleGraphError(error);
    }
};
