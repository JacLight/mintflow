import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

interface EmailAddress {
    value: string;
    type?: string;
}

interface PhoneNumber {
    value: string;
    type?: string;
}

interface Address {
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    type?: string;
}

interface ContactData {
    names: Array<{
        givenName: string;
        familyName: string;
    }>;
    emailAddresses?: Array<{
        value: string;
        type: string;
    }>;
    phoneNumbers?: Array<{
        value: string;
        type: string;
    }>;
    addresses?: Array<{
        streetAddress?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
        type: string;
    }>;
    organizations?: Array<{
        name?: string;
        title?: string;
    }>;
    biographies?: Array<{
        value: string;
        contentType: string;
    }>;
}

export const createContact = {
    name: 'create_contact',
    displayName: 'Create Contact',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            auth: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' }
                },
                required: ['access_token']
            },
            firstName: {
                type: 'string',
                description: 'First name of the contact'
            },
            lastName: {
                type: 'string',
                description: 'Last name of the contact'
            },
            emailAddresses: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                        type: { 
                            type: 'string',
                            enum: ['home', 'work', 'other']
                        }
                    }
                },
                description: 'Email addresses of the contact'
            },
            phoneNumbers: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        value: { type: 'string' },
                        type: { 
                            type: 'string',
                            enum: ['home', 'work', 'mobile', 'main', 'homeFax', 'workFax', 'otherFax', 'pager', 'other']
                        }
                    }
                },
                description: 'Phone numbers of the contact'
            },
            addresses: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        streetAddress: { type: 'string' },
                        city: { type: 'string' },
                        region: { type: 'string' },
                        postalCode: { type: 'string' },
                        country: { type: 'string' },
                        type: { 
                            type: 'string',
                            enum: ['home', 'work', 'other']
                        }
                    }
                },
                description: 'Addresses of the contact'
            },
            company: {
                type: 'string',
                description: 'Company/organization of the contact'
            },
            jobTitle: {
                type: 'string',
                description: 'Job title of the contact'
            },
            notes: {
                type: 'string',
                description: 'Notes about the contact'
            }
        },
        required: ['auth', 'firstName']
    },
    outputSchema: {
        type: 'object',
        properties: {
            resourceName: { type: 'string' },
            etag: { type: 'string' },
            names: { type: 'array' },
            emailAddresses: { type: 'array' },
            phoneNumbers: { type: 'array' },
            addresses: { type: 'array' },
            organizations: { type: 'array' },
            biographies: { type: 'array' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [
            { value: 'john.doe@example.com', type: 'work' },
            { value: 'johndoe@personal.com', type: 'home' }
        ],
        phoneNumbers: [
            { value: '+1234567890', type: 'mobile' },
            { value: '+1987654321', type: 'work' }
        ],
        addresses: [
            {
                streetAddress: '123 Main St',
                city: 'San Francisco',
                region: 'CA',
                postalCode: '94105',
                country: 'USA',
                type: 'work'
            }
        ],
        company: 'Acme Inc.',
        jobTitle: 'Software Engineer',
        notes: 'Met at tech conference'
    },
    exampleOutput: {
        resourceName: 'people/c123456789',
        etag: '%EgUBAj03LhoEAQIFIzsCGAM=',
        names: [
            {
                metadata: { primary: true, source: { type: 'CONTACT', id: 'abcdef' } },
                displayName: 'John Doe',
                familyName: 'Doe',
                givenName: 'John',
                displayNameLastFirst: 'Doe, John'
            }
        ],
        emailAddresses: [
            {
                metadata: { primary: true, source: { type: 'CONTACT', id: 'abcdef' } },
                value: 'john.doe@example.com',
                type: 'work'
            },
            {
                metadata: { source: { type: 'CONTACT', id: 'abcdef' } },
                value: 'johndoe@personal.com',
                type: 'home'
            }
        ],
        phoneNumbers: [
            {
                metadata: { primary: true, source: { type: 'CONTACT', id: 'abcdef' } },
                value: '+1234567890',
                type: 'mobile'
            },
            {
                metadata: { source: { type: 'CONTACT', id: 'abcdef' } },
                value: '+1987654321',
                type: 'work'
            }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                firstName, 
                lastName, 
                emailAddresses, 
                phoneNumbers, 
                addresses,
                company,
                jobTitle,
                notes
            } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Prepare contact data
            const contactData: ContactData = {
                names: [
                    {
                        givenName: firstName,
                        familyName: lastName || ''
                    }
                ]
            };

            // Add email addresses if provided
            if (emailAddresses && emailAddresses.length > 0) {
                contactData.emailAddresses = emailAddresses.map((email: EmailAddress) => ({
                    value: email.value,
                    type: email.type || 'other'
                }));
            }

            // Add phone numbers if provided
            if (phoneNumbers && phoneNumbers.length > 0) {
                contactData.phoneNumbers = phoneNumbers.map((phone: PhoneNumber) => ({
                    value: phone.value,
                    type: phone.type || 'other'
                }));
            }

            // Add addresses if provided
            if (addresses && addresses.length > 0) {
                contactData.addresses = addresses.map((address: Address) => ({
                    streetAddress: address.streetAddress,
                    city: address.city,
                    region: address.region,
                    postalCode: address.postalCode,
                    country: address.country,
                    type: address.type || 'other'
                }));
            }

            // Add organization if company or job title is provided
            if (company || jobTitle) {
                contactData.organizations = [
                    {
                        name: company,
                        title: jobTitle
                    }
                ];
            }

            // Add notes if provided
            if (notes) {
                contactData.biographies = [
                    {
                        value: notes,
                        contentType: 'TEXT_PLAIN'
                    }
                ];
            }

            // Make API request
            const response = await axios.post(
                `${googleApiUrls.contacts}:createContact`,
                contactData,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: unknown) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
