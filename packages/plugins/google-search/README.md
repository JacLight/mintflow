# Google Search Console Plugin for MintFlow

This plugin provides integration with Google Search Console, allowing you to analyze search performance, manage sitemaps, and inspect URLs from your MintFlow workflows.

## Features

- **Search Analytics**: Query traffic data for your site using the Google Search Console API
- **List Sites**: Retrieve a list of sites you have access to in Google Search Console
- **URL Inspection**: Check the indexing status and other details of a specific URL
- **List Sitemaps**: Get information about all sitemaps submitted for a site
- **Submit Sitemap**: Submit a new sitemap to Google Search Console

## Authentication

This plugin requires OAuth2 authentication with Google. You'll need to:

1. Sign in to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Go to **APIs & Services** and click **Enable APIs & Services**
4. Search for **Google Search Console API** in the search bar and enable it
5. Go to **OAuth consent screen** and select **External** type and click create
6. Fill App Name, User Support Email, and Developer Contact Information
7. Add the following scope: `https://www.googleapis.com/auth/webmasters`
8. Go to **Credentials**, click **Create Credentials** and select **OAuth client ID**
9. Select **Web Application** as the application type
10. Add your authorized redirect URIs
11. Copy the **Client ID** and **Client Secret** for use with MintFlow

## Usage Examples

### Analyzing Search Performance

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "siteUrl": "https://example.com",
  "startDate": "2023-01-01",
  "endDate": "2023-01-31",
  "dimensions": ["query", "page", "country"],
  "filters": [
    {
      "dimension": "country",
      "operator": "equals",
      "expression": "usa"
    }
  ],
  "rowLimit": 100
}
```

### Submitting a Sitemap

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "siteUrl": "https://example.com",
  "feedpath": "https://example.com/sitemap.xml"
}
```

### Inspecting a URL

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "siteUrl": "https://example.com",
  "inspectionUrl": "https://example.com/page",
  "category": "ALL"
}
```

## Required Scopes

This plugin requires the following OAuth scope:

- `https://www.googleapis.com/auth/webmasters`: Provides full access to the Search Console API

## Error Handling

The plugin provides detailed error messages when API calls fail. Common errors include:

- Authentication errors (invalid or expired token)
- Permission errors (insufficient scopes)
- Resource not found errors (invalid site URL)
- Validation errors (missing required fields)

## Limitations

- The URL Inspection API has limited functionality compared to the Google Search Console web interface
- Some advanced filtering options may not be available through the API
- Rate limits apply based on Google's API quotas

## Future Enhancements

- Support for additional Search Console features as they become available in the API
- Enhanced URL inspection capabilities
- More detailed search analytics reporting options
- Support for domain property verification
