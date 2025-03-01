export enum CustomFieldType {
    TEXT = 'text',
    DROPDOWN = 'dropdown',
    TEXTAREA = 'textarea',
    NUMBER = 'number',
    MONEY = 'currency',
    DATE = 'date',
    DATETIME = 'datetime',
    LIST_BOX = 'listbox',
    MULTISELECT = 'multiselect',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    HIDDEN = 'hidden',
}

export interface CreateWebhookRequest {
    name: string;
    url: string;
    events: string[];
    sources: string[];
    listid?: string;
}

export interface CreateWebhookResponse {
    webhook: {
        name: string;
        url: string;
        events: string[];
        sources: string[];
        listid: string;
        cdate: string;
        state: string;
        id: string;
    };
}

export interface ContactList {
    id: string;
    name: string;
}

export interface CreateAccountRequest {
    name: string;
    accountUrl?: string;
    fields?: {
        customFieldId: number;
        fieldValue: any;
    }[];
}

export interface CreateContactRequest {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    fieldValues: {
        field: string;
        value: any;
    }[];
}

export interface ListAccountsResponse {
    accounts: {
        name: string;
        id: string;
    }[];
}

export interface ListContactsResponse {
    contacts: {
        email: string;
        firstName: string;
        lastName: string;
        id: string;
    }[];
}

export interface ListTagsResponse {
    tags: {
        tagType: string;
        tag: string;
        id: string;
    }[];
}

export interface AccountCustomFieldsResponse {
    id: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    fieldOptions?: string[];
    fieldDefaultCurrency?: string;
    fieldDefault?: number | string | string[];
}

export interface ContactCustomFieldsResponse {
    fieldOptions: { field: string; value: string; label: string; id: string }[];
    fields: { id: string; title: string; type: CustomFieldType; options: string[] }[];
}
