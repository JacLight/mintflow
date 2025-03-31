import { makeClient, ApolloAuth } from '../common/index.js';

export const enrichCompany = {
    name: "enrich_company",
    description: "Retrieves detailed information about a company based on its domain",
    inputSchema: {
        type: "object",
        properties: {
            domain: {
                type: "string",
                description: "Domain of the company to enrich (e.g., example.com)"
            },
            cacheResponse: {
                type: "boolean",
                description: "Whether to cache the response for future use",
                default: true
            }
        },
        required: ["domain"]
    },
    outputSchema: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "Apollo ID of the company"
            },
            name: {
                type: "string",
                description: "Name of the company"
            },
            website_url: {
                type: "string",
                description: "Website URL of the company"
            },
            domain: {
                type: "string",
                description: "Domain of the company"
            },
            phone: {
                type: "string",
                description: "Phone number of the company"
            },
            industry: {
                type: "string",
                description: "Industry of the company"
            },
            linkedin_url: {
                type: "string",
                description: "LinkedIn URL of the company"
            },
            description: {
                type: "string",
                description: "Description of the company"
            },
            founded_year: {
                type: "number",
                description: "Year the company was founded"
            },
            employee_count: {
                type: "number",
                description: "Number of employees at the company"
            },
            annual_revenue: {
                type: "number",
                description: "Annual revenue of the company"
            },
            location: {
                type: "object",
                description: "Location information of the company"
            },
            technologies: {
                type: "array",
                description: "Technologies used by the company",
                items: {
                    type: "string"
                }
            }
        }
    },
    exampleInput: {
        domain: "example.com",
        cacheResponse: true
    },
    exampleOutput: {
        id: "5f4e3d2c1b0a9876543210",
        name: "Example Inc.",
        website_url: "https://example.com",
        domain: "example.com",
        phone: "+1 (555) 123-4567",
        industry: "Software",
        linkedin_url: "https://www.linkedin.com/company/example-inc",
        description: "Example Inc. is a software company that provides example solutions.",
        founded_year: 2010,
        employee_count: 500,
        annual_revenue: 10000000,
        location: {
            country: "United States",
            city: "San Francisco",
            state: "CA"
        },
        technologies: ["React", "Node.js", "AWS"]
    },
    execute: async (input: any, auth: ApolloAuth, store?: any) => {
        try {
            const { domain, cacheResponse = true } = input.data || {};

            if (!domain) {
                return { error: "Domain is required" };
            }

            // Check cache if enabled
            if (cacheResponse && store) {
                const cachedResult = await store.get(`_apollo_org_${domain}`);
                if (cachedResult) {
                    return cachedResult;
                }
            }

            const client = makeClient(auth);
            const result = await client.enrichCompany(domain);

            // Store in cache if enabled
            if (cacheResponse && store && Object.keys(result).length > 0) {
                await store.put(`_apollo_org_${domain}`, result);
            }

            return result;
        } catch (error: any) {
            return {
                error: `Error enriching company: ${error.message || 'Unknown error'}`
            };
        }
    }
};
