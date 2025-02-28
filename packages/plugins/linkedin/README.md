# LinkedIn Plugin for MintFlow

The LinkedIn plugin for MintFlow provides integration with LinkedIn's API, allowing you to create and manage content on LinkedIn from your workflows.

## Features

- Create personal share updates on LinkedIn
- Create company page updates on LinkedIn
- Support for text, links, and images in updates
- Control visibility of personal updates (public or connections-only)

## Authentication

This plugin requires OAuth 2.0 authentication with LinkedIn. You'll need:

1. A LinkedIn OAuth access token
2. A LinkedIn OAuth ID token (for personal updates)

### Setting up LinkedIn OAuth

To use this plugin, you'll need to create a LinkedIn Developer application:

1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Click "Create App" and fill in the required information
3. Under "Auth" tab, add OAuth 2.0 redirect URLs for your application
4. Request the following OAuth 2.0 scopes:
   - `w_member_social` - For creating personal updates
   - `w_organization_social` - For creating company updates
   - `rw_organization_admin` - For managing company pages
   - `openid`, `email`, `profile` - For user identification

## Actions

### Create Share Update

Creates a personal update on your LinkedIn profile.

**Parameters:**

- `accessToken` (required): LinkedIn OAuth access token
- `idToken` (required): LinkedIn OAuth ID token
- `text` (required): The text content of the update
- `visibility` (required): The visibility of the update (`PUBLIC` or `CONNECTIONS`)
- `imageData` (optional): Base64-encoded image data
- `imageFilename` (optional): Filename of the image
- `link` (optional): URL to share in the update
- `linkTitle` (optional): Title for the shared URL
- `linkDescription` (optional): Description for the shared URL

**Example:**

```javascript
const result = await mintflow.linkedin.createShareUpdate({
  accessToken: "your-linkedin-access-token",
  idToken: "your-linkedin-id-token",
  text: "Excited to share this new article!",
  visibility: "PUBLIC",
  link: "https://example.com/article",
  linkTitle: "Interesting Article",
  linkDescription: "An interesting article about technology"
});
```

### Create Company Update

Creates an update on a LinkedIn company page.

**Parameters:**

- `accessToken` (required): LinkedIn OAuth access token
- `companyId` (required): LinkedIn company ID
- `text` (required): The text content of the update
- `imageData` (optional): Base64-encoded image data
- `imageFilename` (optional): Filename of the image
- `link` (optional): URL to share in the update
- `linkTitle` (optional): Title for the shared URL
- `linkDescription` (optional): Description for the shared URL

**Example:**

```javascript
const result = await mintflow.linkedin.createCompanyUpdate({
  accessToken: "your-linkedin-access-token",
  companyId: "12345678",
  text: "Check out our latest product announcement!",
  link: "https://example.com/product",
  linkTitle: "New Product Announcement",
  linkDescription: "Learn about our exciting new product"
});
```

## Finding Your Company ID

To find your LinkedIn company ID:

1. Go to your company page on LinkedIn
2. Look at the URL, which will be in the format: `https://www.linkedin.com/company/[company-name]/`
3. Use the LinkedIn API to list your companies:
   ```javascript
   const companies = await mintflow.linkedin.listCompanies({
     accessToken: "your-linkedin-access-token"
   });
   ```

## Error Handling

All actions return a response with:

- `success`: Boolean indicating if the operation succeeded
- `message`: Description of the result or error

## API Reference

This plugin uses the [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api) to create and manage content.

## Limitations

- LinkedIn API rate limits apply
- Image uploads are limited to 5MB
- Text content must follow LinkedIn's content policies
