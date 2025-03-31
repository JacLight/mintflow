# MintFlow Apollo Plugin

The Apollo plugin for MintFlow provides integration with Apollo.io, a sales intelligence and engagement platform. This plugin allows you to find contact information and enrich company data.

## Authentication

To use this plugin, you need to provide:

- **API Key**: Your Apollo API Key

You can find your API key in your Apollo account settings.

## Actions

### Person Information

- **Match Person**: Finds a person's information based on their email address
  - Returns detailed information including name, job title, LinkedIn URL, phone numbers, and organization details

### Company Information

- **Enrich Company**: Retrieves detailed information about a company based on its domain
  - Returns comprehensive company data including industry, size, revenue, location, technologies used, and more

## Example Usage

### Finding a Person by Email

```javascript
const result = await mintflow.apollo.match_person({
  email: "john.doe@example.com",
  cacheResponse: true // Optional, defaults to true
});

console.log(`Found ${result.name} who works at ${result.organization.name}`);
console.log(`LinkedIn: ${result.linkedin_url}`);
console.log(`Title: ${result.title}`);
```

### Enriching Company Data

```javascript
const result = await mintflow.apollo.enrich_company({
  domain: "example.com",
  cacheResponse: true // Optional, defaults to true
});

console.log(`Company: ${result.name}`);
console.log(`Industry: ${result.industry}`);
console.log(`Employees: ${result.employee_count}`);
console.log(`Annual Revenue: $${result.annual_revenue}`);
console.log(`Technologies: ${result.technologies.join(", ")}`);
```

## Caching

Both actions support caching to improve performance and reduce API usage. When `cacheResponse` is set to `true` (the default), the plugin will store the response in the project store for future use. This is particularly useful for data that doesn't change frequently.

## Dependencies

This plugin uses the following dependencies:

- axios: For making HTTP requests to the Apollo API

## License

MIT
