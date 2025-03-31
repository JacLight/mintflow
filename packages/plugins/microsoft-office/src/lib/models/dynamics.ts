import { MicrosoftOfficeBaseParams } from './index.js';

// Dynamics CRM parameters
export interface DynamicsListContactsParams extends MicrosoftOfficeBaseParams {
    filter?: string;
    top?: number;
}

export interface DynamicsGetContactParams extends MicrosoftOfficeBaseParams {
    contactId: string;
}

export interface DynamicsCreateContactParams extends MicrosoftOfficeBaseParams {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    address?: DynamicsAddress;
}

export interface DynamicsUpdateContactParams extends MicrosoftOfficeBaseParams {
    contactId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    address?: DynamicsAddress;
}

export interface DynamicsDeleteContactParams extends MicrosoftOfficeBaseParams {
    contactId: string;
}

export interface DynamicsListAccountsParams extends MicrosoftOfficeBaseParams {
    filter?: string;
    top?: number;
}

export interface DynamicsGetAccountParams extends MicrosoftOfficeBaseParams {
    accountId: string;
}

export interface DynamicsCreateAccountParams extends MicrosoftOfficeBaseParams {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: number;
    revenue?: number;
    address?: DynamicsAddress;
}

export interface DynamicsUpdateAccountParams extends MicrosoftOfficeBaseParams {
    accountId: string;
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: number;
    revenue?: number;
    address?: DynamicsAddress;
}

export interface DynamicsDeleteAccountParams extends MicrosoftOfficeBaseParams {
    accountId: string;
}

export interface DynamicsListOpportunitiesParams extends MicrosoftOfficeBaseParams {
    filter?: string;
    top?: number;
}

export interface DynamicsGetOpportunityParams extends MicrosoftOfficeBaseParams {
    opportunityId: string;
}

export interface DynamicsCreateOpportunityParams extends MicrosoftOfficeBaseParams {
    name: string;
    customerId: string;
    estimatedValue?: number;
    estimatedCloseDate?: string;
    description?: string;
    probability?: number;
}

export interface DynamicsUpdateOpportunityParams extends MicrosoftOfficeBaseParams {
    opportunityId: string;
    name?: string;
    customerId?: string;
    estimatedValue?: number;
    estimatedCloseDate?: string;
    description?: string;
    probability?: number;
    status?: number;
    statusReason?: number;
}

export interface DynamicsDeleteOpportunityParams extends MicrosoftOfficeBaseParams {
    opportunityId: string;
}

// Dynamics CRM response types
export interface DynamicsAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface DynamicsContact {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    address: DynamicsAddress;
}

export interface DynamicsAccount {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: number;
    revenue?: number;
    address: DynamicsAddress;
}

export interface DynamicsOpportunity {
    id: string;
    name: string;
    customerId: string;
    estimatedValue?: number;
    estimatedCloseDate?: string;
    description?: string;
    probability?: number;
    status?: number;
    statusReason?: number;
}
