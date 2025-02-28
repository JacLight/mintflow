import { SimplePublicObjectInput } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { createHubSpotClient, formatArrayValues, getDefaultPropertiesForObject, OBJECT_TYPE } from '../common.js';

export interface UpdateContactInput {
  auth: {
    access_token: string;
  };
  contactId: string;
  properties: Record<string, any>;
  additionalPropertiesToRetrieve?: string[];
}

export interface UpdateContactOutput {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export async function updateContact(input: UpdateContactInput): Promise<UpdateContactOutput> {
  const { auth, contactId, properties, additionalPropertiesToRetrieve = [] } = input;
  
  // Format array values to string with semicolons
  const contactProperties = formatArrayValues(properties);
  
  // Create HubSpot client
  const client = createHubSpotClient(auth);
  
  try {
    // Update contact with required structure
    const contactInput: SimplePublicObjectInput = {
      properties: contactProperties
    };
    
    await client.crm.contacts.basicApi.update(contactId, contactInput);
    
    // Retrieve default properties for the contact and merge with additional properties to retrieve
    const defaultContactProperties = getDefaultPropertiesForObject(OBJECT_TYPE.CONTACT);
    
    // Get updated contact details with all properties
    const contactDetails = await client.crm.contacts.basicApi.getById(
      contactId,
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
      throw new Error(`Failed to update contact: ${error.message}`);
    }
    throw new Error('Failed to update contact: Unknown error');
  }
}
