import { Filter, FilterGroup } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { createHubSpotClient, FilterOperatorEnum, getDefaultPropertiesForObject, OBJECT_TYPE } from '../common.js';

export interface FindContactInput {
  auth: {
    access_token: string;
  };
  searchQuery: string;
  limit?: number;
  after?: string;
  properties?: string[];
  filterGroups?: Array<{
    filters: Array<{
      propertyName: string;
      operator: FilterOperatorEnum | string;
      value: string;
    }>;
  }>;
}

export interface FindContactOutput {
  results: Array<{
    id: string;
    properties: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    archived: boolean;
  }>;
  paging?: {
    next?: {
      after: string;
    };
  };
}

export async function findContact(input: FindContactInput): Promise<FindContactOutput> {
  const { auth, searchQuery, limit = 10, after, properties = [], filterGroups = [] } = input;
  
  // Create HubSpot client
  const client = createHubSpotClient(auth);
  
  try {
    // Retrieve default properties for the contact if no properties are specified
    const defaultContactProperties = properties.length > 0 
      ? properties 
      : getDefaultPropertiesForObject(OBJECT_TYPE.CONTACT);
    
    // Create search request
    const searchRequest: any = {
      query: searchQuery,
      limit: typeof limit === 'number' ? limit : 10,
      properties: defaultContactProperties,
      filterGroups: filterGroups.map(group => {
        const filterGroup: FilterGroup = {
          filters: group.filters.map(filter => {
            const filterObj: Filter = {
              propertyName: filter.propertyName,
              operator: filter.operator as FilterOperatorEnum,
              value: filter.value
            };
            return filterObj;
          })
        };
        return filterGroup;
      }),
      sorts: []
    };
    
    // Add after parameter if provided
    if (after) {
      searchRequest.after = after;
    }
    
    // Search for contacts
    const searchResults = await client.crm.contacts.searchApi.doSearch(searchRequest);
    
    // Format results
    return {
      results: searchResults.results.map(contact => ({
        id: contact.id,
        properties: contact.properties,
        createdAt: contact.createdAt ? contact.createdAt.toISOString() : '',
        updatedAt: contact.updatedAt ? contact.updatedAt.toISOString() : '',
        archived: contact.archived || false,
      })),
      paging: searchResults.paging
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to find contacts: ${error.message}`);
    }
    throw new Error('Failed to find contacts: Unknown error');
  }
}
