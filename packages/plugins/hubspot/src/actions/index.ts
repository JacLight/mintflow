import { createContact, CreateContactInput, CreateContactOutput } from './create-contact.js';
import { getContact, GetContactInput, GetContactOutput } from './get-contact.js';
import { updateContact, UpdateContactInput, UpdateContactOutput } from './update-contact.js';
import { findContact, FindContactInput, FindContactOutput } from './find-contact.js';

// Export functions
export { createContact, getContact, updateContact, findContact };

// Export types
export type { 
  // Create contact
  CreateContactInput,
  CreateContactOutput,
  
  // Get contact
  GetContactInput,
  GetContactOutput,
  
  // Update contact
  UpdateContactInput,
  UpdateContactOutput,
  
  // Find contact
  FindContactInput,
  FindContactOutput
};
