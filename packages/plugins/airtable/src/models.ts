// Airtable data models

export interface AirtableBase {
    id: string;
    name: string;
    permissionLevel: AirtablePermissionLevel;
}

export interface AirtableRecord {
    id: string;
    fields: Record<string, unknown>;
    createdTime: string;
}

export interface AirtableField {
    id: string;
    name: string;
    description: string;
    type: AirtableFieldType;
    options?: {
        choices: AirtableChoice[];
    };
}

export interface AirtableChoice {
    id: string;
    name: string;
    color: string;
}

export interface AirtableTable {
    id: string;
    name: string;
    fields: AirtableField[];
    description: string;
    primaryFieldId: string;
    views: AirtableView[];
}

export interface AirtableView {
    id: string;
    name: string;
    type: string;
}

export type AirtablePermissionLevel = 'none' | 'read' | 'comment' | 'edit' | 'create';

export type AirtableFieldType =
    | 'singleLineText'
    | 'email'
    | 'url'
    | 'multilineText'
    | 'number'
    | 'percent'
    | 'currency'
    | 'singleSelect'
    | 'multipleSelects'
    | 'multipleRecordLinks'
    | 'date'
    | 'dateTime'
    | 'phoneNumber'
    | 'multipleAttachments'
    | 'checkbox'
    | 'formula'
    | 'createdTime'
    | 'rollup'
    | 'count'
    | 'lookup'
    | 'multipleLookupValues'
    | 'autoNumber'
    | 'barcode'
    | 'rating'
    | 'richText'
    | 'duration'
    | 'lastModifiedTime'
    | 'button'
    | 'createdBy'
    | 'lastModifiedBy'
    | 'externalSyncSource';

// Enterprise fields that we don't support
export const AirtableEnterpriseFields = [
    'singleCollaborator',
    'multipleCollaborators',
    'aiText',
];

// Field type mapping for dynamic properties
export const AirtableFieldTypeMapping: Record<string, string> = {
    singleLineText: 'string',
    email: 'string',
    url: 'string',
    multilineText: 'string',
    number: 'number',
    percent: 'string',
    currency: 'string',
    singleSelect: 'string',
    multipleSelects: 'array',
    multipleRecordLinks: 'array',
    date: 'string',
    dateTime: 'string',
    phoneNumber: 'string',
    multipleAttachments: 'string',
    checkbox: 'boolean',
    formula: 'string',
    createdTime: 'string',
    rollup: 'string',
    count: 'string',
    lookup: 'string',
    multipleLookupValues: 'string',
    autoNumber: 'number',
    barcode: 'string',
    rating: 'string',
    richText: 'string',
    duration: 'string',
    lastModifiedTime: 'string',
    button: 'string',
    createdBy: 'string',
    lastModifiedBy: 'string',
    externalSyncSource: 'string',
};
