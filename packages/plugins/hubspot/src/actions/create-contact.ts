import { SimplePublicObjectInputForCreate } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { createHubSpotClient, formatArrayValues, getDefaultPropertiesForObject, OBJECT_TYPE } from '../common.js';

export interface CreateContactInput {
  auth: {
    access_token: string;
  };
  properties: Record<string, any>;
  additionalPropertiesToRetrieve?: string[];
}

export interface CreateContactOutput {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export async function createContact(input: CreateContactInput): Promise<CreateContactOutput> {
  const { auth, properties, additionalPropertiesToRetrieve = [] } = input;
  
  // Format array values to string with semicolons
  const contactProperties = formatArrayValues(properties);
  
  // Create HubSpot client
  const client = createHubSpotClient(auth);
  
  try {
    // Create contact with required structure
    const contactInput: SimplePublicObjectInputForCreate = {
      properties: contactProperties,
      associations: []
    };
    
    const createdContact = await client.crm.contacts.basicApi.create(contactInput);
    
    // Retrieve default properties for the contact and merge with additional properties to retrieve
    const defaultContactProperties = getDefaultPropertiesForObject(OBJECT_TYPE.CONTACT);
    
    // Get contact details with all properties
    const contactDetails = await client.crm.contacts.basicApi.getById(
      createdContact.id,
      [...defaultContactProperties, ...additionalPropertiesToRetrieve]
    );
    
    return {
      id: contactDetails.id,
      properties: contactDetails.properties,
      createdAt: contactDetails.createdAt ? contactDetails.createdAt.toISOString() : '',
      updatedAt: contactDetails.updatedAt ? contactDetails.updatedAt.toISOString() : '',
      archived: contactDetails.archived || false,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }
    throw new Error('Failed to create contact: Unknown error');
  }
}
