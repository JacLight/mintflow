import axios from 'axios';
import { Client } from '@hubspot/api-client';

// Object types
export enum OBJECT_TYPE {
  CONTACT = 'contact',
  COMPANY = 'company',
  DEAL = 'deal',
  TICKET = 'ticket',
  PRODUCT = 'product',
  LINE_ITEM = 'line_item',
  TASK = 'task',
}

// Default properties for each object type
export const DEFAULT_CONTACT_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'company',
  'website',
  'mobilephone',
  'phone',
  'fax',
  'address',
  'city',
  'state',
  'zip',
  'salutation',
  'country',
  'jobtitle',
  'hs_createdate',
  'hs_email_domain',
  'hs_object_id',
  'lastmodifieddate',
  'hs_persona',
  'hs_language',
  'lifecyclestage',
  'createdate',
  'numemployees',
  'annualrevenue',
  'industry',
];

export const DEFAULT_COMPANY_PROPERTIES = [
  'name',
  'domain',
  'industry',
  'about_us',
  'phone',
  'address',
  'address2',
  'city',
  'state',
  'zip',
  'country',
  'website',
  'type',
  'description',
  'founded_year',
  'hs_createdate',
  'hs_lastmodifieddate',
  'hs_object_id',
  'is_public',
  'timezone',
  'total_money_raised',
  'total_revenue',
  'owneremail',
  'ownername',
  'numberofemployees',
  'annualrevenue',
  'lifecyclestage',
  'createdate',
  'web_technologies',
];

export const DEFAULT_DEAL_PROPERTIES = [
  'dealtype',
  'dealname',
  'amount',
  'description',
  'closedate',
  'createdate',
  'num_associated_contacts',
  'hs_forecast_amount',
  'hs_forecast_probability',
  'hs_manual_forecast_category',
  'hs_next_step',
  'hs_object_id',
  'hs_lastmodifieddate',
  'hubspot_owner_id',
  'hubspot_team_id',
];

export const DEFAULT_TICKET_PROPERTIES = [
  'subject',
  'content',
  'source_type',
  'createdate',
  'hs_pipeline',
  'hs_pipeline_stage',
  'hs_resolution',
  'hs_ticket_category',
  'hs_ticket_id',
  'hs_ticket_priority',
  'hs_lastmodifieddate',
  'hubspot_owner_id',
  'hubspot_team_id',
];

export const DEFAULT_PRODUCT_PROPERTIES = [
  'createdate',
  'description',
  'name',
  'price',
  'tax',
  'hs_lastmodifieddate',
];

export const DEFAULT_LINE_ITEM_PROPERTIES = [
  'name',
  'description',
  'price',
  'quantity',
  'amount',
  'discount',
  'tax',
  'createdate',
  'hs_object_id',
  'hs_product_id',
  'hs_images',
  'hs_lastmodifieddate',
  'hs_line_item_currency_code',
  'hs_sku',
  'hs_url',
  'hs_cost_of_goods_sold',
  'hs_discount_percentage',
  'hs_term_in_months',
];

export const DEFAULT_TASK_PROPERTIES = [
  'hs_task_body',
  'hubspot_owner_id',
  'hs_task_subject',
  'hs_task_status',
  'hs_task_priority',
  'hs_task_type',
  'hs_created_by',
  'hs_repeat_status',
  'hs_task_completion_date',
  'hs_task_is_completed',
  'hs_timestamp',
  'hs_queue_membership_ids',
  'hs_lastmodifieddate',
  'hs_createdate',
];

// Types
export interface HubSpotAuthData {
  access_token: string;
}

export interface HubSpotAddContactsToListResponse {
  updated: number[];
  discarded: number[];
  invalidVids: number[];
  invalidEmails: string[];
}

export interface HubspotProperty {
  name: string;
  label: string;
  description: string;
  hidden?: boolean;
  type: string;
  groupName: string;
  fieldType: string;
  referencedObjectType?: string;
  modificationMetadata?: {
    archivable: boolean;
    readOnlyDefinition: boolean;
    readOnlyValue: boolean;
  };
  options: Array<{ label: string; value: string }>;
}

export interface WorkflowResponse {
  id: number;
  insertAt: number;
  updatedAt: number;
  name: string;
  enabled: boolean;
}

export enum FilterOperatorEnum {
  Eq = 'EQ',
  Neq = 'NEQ',
  Lt = 'LT',
  Lte = 'LTE',
  Gt = 'GT',
  Gte = 'GTE',
  Between = 'BETWEEN',
  In = 'IN',
  NotIn = 'NOT_IN',
  HasProperty = 'HAS_PROPERTY',
  NotHasProperty = 'NOT_HAS_PROPERTY',
  ContainsToken = 'CONTAINS_TOKEN',
  NotContainsToken = 'NOT_CONTAINS_TOKEN',
}

export enum HubspotFieldType {
  BooleanCheckBox = 'booleancheckbox',
  Date = 'date',
  File = 'file',
  Number = 'number',
  CalculationEquation = 'calculation_equation',
  PhoneNumber = 'phonenumber',
  Text = 'text',
  TextArea = 'textarea',
  Html = 'html',
  CheckBox = 'checkbox',
  Select = 'select',
  Radio = 'radio',
}

export enum AssociationSpecAssociationCategoryEnum {
  HubspotDefined = 'HUBSPOT_DEFINED',
  UserDefined = 'USER_DEFINED',
  IntegratorDefined = 'INTEGRATOR_DEFINED',
}

export interface ListBlogsResponse {
  objects: Array<{ absolute_url: string; id: number }>;
  offset: number;
  total: number;
  limit: number;
}

// Utility functions
export function getDefaultPropertiesForObject(objectType: OBJECT_TYPE): string[] {
  switch (objectType) {
    case OBJECT_TYPE.CONTACT:
      return DEFAULT_CONTACT_PROPERTIES;
    case OBJECT_TYPE.COMPANY:
      return DEFAULT_COMPANY_PROPERTIES;
    case OBJECT_TYPE.DEAL:
      return DEFAULT_DEAL_PROPERTIES;
    case OBJECT_TYPE.TICKET:
      return DEFAULT_TICKET_PROPERTIES;
    case OBJECT_TYPE.PRODUCT:
      return DEFAULT_PRODUCT_PROPERTIES;
    case OBJECT_TYPE.LINE_ITEM:
      return DEFAULT_LINE_ITEM_PROPERTIES;
    case OBJECT_TYPE.TASK:
      return DEFAULT_TASK_PROPERTIES;
    default:
      return [];
  }
}

export function createHubSpotClient(auth: HubSpotAuthData): Client {
  return new Client({ accessToken: auth.access_token });
}

export async function validateHubSpotToken(token: string): Promise<boolean> {
  try {
    const response = await axios.get('https://api.hubapi.com/oauth/v1/access-tokens/' + token);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export function formatArrayValues(properties: Record<string, any>): Record<string, string> {
  const formattedProperties: Record<string, string> = {};
  
  Object.entries(properties).forEach(([key, value]) => {
    formattedProperties[key] = Array.isArray(value) ? value.join(';') : value;
  });
  
  return formattedProperties;
}
