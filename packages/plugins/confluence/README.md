# Confluence Plugin for MintFlow

This plugin allows you to integrate with Atlassian Confluence, enabling you to create, read, and manage content in your Confluence spaces.

## Authentication

To use this plugin, you'll need:

1. **Account Email**: Your Atlassian account email address
2. **API Token**: An API token for your Atlassian account
3. **Confluence Domain**: Your Confluence domain (e.g., <https://your-domain.atlassian.net>)

### How to get your API Token

1. Log in to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give your token a name (e.g., "MintFlow Integration")
4. Click "Create"
5. Copy the generated token (you won't be able to see it again)

## Actions

### Get Page Content

Retrieves the content of a Confluence page and optionally all its descendants.

**Input:**

- `username`: Your Atlassian account email
- `password`: Your API token
- `confluenceDomain`: Your Confluence domain
- `pageId`: The ID of the page to retrieve
- `includeDescendants`: Whether to include child pages (optional, default: false)
- `maxDepth`: Maximum depth of child pages to fetch (optional, default: 5)

**Output:**

- Page content including title, body, and optionally child pages

### Create Page from Template

Creates a new page in Confluence using a template.

**Input:**

- `username`: Your Atlassian account email
- `password`: Your API token
- `confluenceDomain`: Your Confluence domain
- `spaceId`: The ID of the space where the page will be created
- `templateId`: The ID of the template to use
- `folderId`: The ID of the parent folder (optional)
- `title`: The title of the new page
- `status`: The status of the new page ('current' for published or 'draft')
- `templateVariables`: Variables to replace in the template (optional)

**Output:**

- Details of the created page including ID, title, and links

## Triggers

### New Page

Triggers when a new page is created in a specified Confluence space.

**Input:**

- `username`: Your Atlassian account email
- `password`: Your API token
- `confluenceDomain`: Your Confluence domain
- `spaceId`: The ID of the space to monitor
- `pollingInterval`: How often to check for new pages (in seconds, default: 300)

**Output:**

- Details of the newly created page

## Examples

### Get content of a page and its children

```json
{
  "username": "user@example.com",
  "password": "your-api-token",
  "confluenceDomain": "https://your-domain.atlassian.net",
  "pageId": "123456789",
  "includeDescendants": true,
  "maxDepth": 3
}
```

### Create a page from a template

```json
{
  "username": "user@example.com",
  "password": "your-api-token",
  "confluenceDomain": "https://your-domain.atlassian.net",
  "spaceId": "123456789",
  "templateId": "987654321",
  "title": "New Meeting Notes",
  "status": "draft",
  "templateVariables": {
    "date": "2025-02-28",
    "attendees": "John, Jane, Bob",
    "agenda": "Discuss project timeline"
  }
}
```

## Resources

- [Atlassian Confluence REST API Documentation](https://developer.atlassian.com/cloud/confluence/rest/v2/intro/)
- [Atlassian API Tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
