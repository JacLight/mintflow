import { createHubSpotClient, getDefaultPropertiesForObject, OBJECT_TYPE } from '../common.js';

export interface GetContactInput {
  auth: {
    access_token: string;
  };
  contactId: string;
  additionalPropertiesToRetrieve?: string[];
}

export interface GetContactOutput {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export async function getContact(input: GetContactInput): Promise<GetContactOutput> {
  const { auth, contactId, additionalPropertiesToRetrieve = [] } = input;
  
  // Create HubSpot client
  const client = createHubSpotClient(auth);
  
  try {
    // Retrieve default properties for the contact and merge with additional properties to retrieve
    const defaultContactProperties = getDefaultPropertiesForObject(OBJECT_TYPE.CONTACT);
    
    // Get contact details with all properties
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
      throw new Error(`Failed to get contact: ${error.message}`);
    }
    throw new Error('Failed to get contact: Unknown error');
  }
}
