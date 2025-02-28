// Salesforce data models

export interface SalesforceObject {
    name: string;
    label: string;
    custom: boolean;
    customSetting: boolean;
    queryable: boolean;
    retrieveable: boolean;
    updateable: boolean;
    createable: boolean;
    deletable: boolean;
    undeletable: boolean;
    mergeable: boolean;
    replicateable: boolean;
    triggerable: boolean;
    feedEnabled: boolean;
    searchable: boolean;
    layoutable: boolean;
    activateable: boolean;
    urls: Record<string, string>;
}

export interface SalesforceField {
    name: string;
    label: string;
    type: string;
    custom: boolean;
    nillable: boolean;
    defaultedOnCreate: boolean;
    createable: boolean;
    updateable: boolean;
    unique: boolean;
    caseSensitive: boolean;
    calculated: boolean;
    scale: number;
    precision: number;
    nameField: boolean;
    externalId: boolean;
    idLookup: boolean;
    filterable: boolean;
    sortable: boolean;
    groupable: boolean;
    writeRequiresMasterRead: boolean;
    displayLocationInDecimal: boolean;
    restrictedPicklist: boolean;
    namePointing: boolean;
    customField: boolean;
    htmlFormatted: boolean;
    dependentPicklist: boolean;
    permissionable: boolean;
    referenceTo: string[];
    relationshipName: string;
    relationshipOrder: number;
    referenceTargetField: string;
    cascadeDelete: boolean;
    restrictedDelete: boolean;
    defaultValueFormula: string;
    defaultValue: string;
    digits: number;
    length: number;
    byteLength: number;
    soapType: string;
    picklistValues: SalesforcePicklistValue[];
}

export interface SalesforcePicklistValue {
    active: boolean;
    defaultValue: boolean;
    label: string;
    validFor: string;
    value: string;
}

export interface SalesforceCreateResponse {
    id: string;
    success: boolean;
    errors: string[];
    created: boolean;
}

export interface SalesforceUpsertResponse {
    id: string;
    success: boolean;
    errors: string[];
    created: boolean;
}

export interface SalesforceQueryResponse {
    totalSize: number;
    done: boolean;
    records: Record<string, any>[];
    nextRecordsUrl?: string;
}

export interface SalesforceBulkJobResponse {
    id: string;
    operation: string;
    object: string;
    createdById: string;
    createdDate: string;
    systemModstamp: string;
    state: string;
    externalIdFieldName: string;
    concurrencyMode: string;
    contentType: string;
    apiVersion: string;
    jobType: string;
    lineEnding: string;
    columnDelimiter: string;
    numberRecordsProcessed: number;
    numberRecordsFailed: number;
    retries: number;
    totalProcessingTime: number;
    apiActiveProcessingTime: number;
    apexProcessingTime: number;
}

export interface SalesforceRecord {
    Id: string;
    [key: string]: any;
}
