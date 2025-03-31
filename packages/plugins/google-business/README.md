# Google My Business Plugin for MintFlow

This plugin provides integration with Google My Business (now Google Business Profile), allowing you to manage your business listings, locations, and reviews from your MintFlow workflows.

## Features

- **Create or Update Reply**: Respond to customer reviews on your Google Business Profile
- **List Accounts**: Retrieve a list of all Google My Business accounts you have access to
- **List Locations**: Get information about all locations associated with a specific account
- **List Reviews**: Retrieve customer reviews for a specific location

## Authentication

This plugin requires OAuth2 authentication with Google. You'll need to:

1. Sign in to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Go to **APIs & Services** and click **Enable APIs & Services**
4. Search for **Google My Business API** in the search bar and enable it
5. Go to **OAuth consent screen** and select **External** type and click create
6. Fill App Name, User Support Email, and Developer Contact Information
7. Add the following scope: `https://www.googleapis.com/auth/business.manage`
8. Go to **Credentials**, click **Create Credentials** and select **OAuth client ID**
9. Select **Web Application** as the application type
10. Add your authorized redirect URIs
11. Copy the **Client ID** and **Client Secret** for use with MintFlow

## Usage Examples

### Replying to a Review

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "reviewName": "accounts/123456789/locations/987654321/reviews/12345",
  "comment": "Thank you for your feedback! We appreciate your business and look forward to serving you again."
}
```

### Listing Locations for an Account

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "accountName": "accounts/123456789",
  "pageSize": 50,
  "readMask": "title,name,primaryPhone,websiteUri,storefrontAddress"
}
```

### Retrieving Reviews for a Location

```javascript
{
  "auth": {
    "access_token": "your_oauth_token"
  },
  "locationName": "accounts/123456789/locations/987654321",
  "pageSize": 20,
  "orderBy": "updateTime desc"
}
```

## Required Scopes

This plugin requires the following OAuth scope:

- `https://www.googleapis.com/auth/business.manage`: Provides full access to manage your Google Business Profile

## Error Handling

The plugin provides detailed error messages when API calls fail. Common errors include:

- Authentication errors (invalid or expired token)
- Permission errors (insufficient scopes)
- Resource not found errors (invalid account or location name)
- Validation errors (missing required fields or invalid format)

## Limitations

- The Google My Business API has rate limits that may affect high-volume operations
- Some advanced features available in the Google Business Profile web interface may not be available through the API
- The API may have delays in reflecting recent changes to your business profile

## Future Enhancements

- Support for creating and updating business information
- Media management capabilities (photos, videos)
- Post creation and management
- Attribute management for business listings
- Support for service-specific features (menus, services, etc.)
