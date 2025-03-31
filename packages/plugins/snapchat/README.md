# Snapchat Plugin for MintFlow

This plugin provides integration with the Snapchat Marketing API, allowing you to create and manage ads, campaigns, and creatives on Snapchat.

## Features

- Create ads on Snapchat
- Create advertising campaigns
- Create ad creatives
- Retrieve ads from an ad account
- Retrieve campaigns from an ad account
- Retrieve ad accounts

## Authentication

To use this plugin, you need a Snapchat API OAuth token with the appropriate scopes:

- `snapchat-marketing-api`
- `campaigns`
- `organizations`
- `creatives`

### How to obtain a Snapchat API OAuth token

1. Go to [Snapchat Business Manager](https://business.snapchat.com/)
2. Create a business account if you don't have one
3. Go to the Business Settings > Organization Settings
4. Navigate to the "Developer" section
5. Create a new OAuth App
6. Configure your app:
   - Add the required scopes
   - Set up your redirect URI
   - Complete the app information
7. Once approved, you can use the client ID and client secret to obtain OAuth tokens
8. Implement the OAuth 2.0 flow to get user access tokens

## Usage

### Create an Ad

```javascript
{
  "action": "create_ad",
  "token": "your-snapchat-api-token",
  "adAccountId": "12345678-1234-1234-1234-123456789012",
  "campaignId": "12345678-1234-1234-1234-123456789012",
  "creativeId": "12345678-1234-1234-1234-123456789012",
  "name": "My Snapchat Ad",
  "status": "ACTIVE",
  "dailyBudget": 1000000, // Optional, in micro-currency (1000000 = $1.00 USD)
  "lifetimeBudget": 10000000, // Optional, in micro-currency
  "startTime": "2023-01-01T00:00:00Z", // Optional
  "endTime": "2023-12-31T23:59:59Z" // Optional
}
```

### Create a Campaign

```javascript
{
  "action": "create_campaign",
  "token": "your-snapchat-api-token",
  "adAccountId": "12345678-1234-1234-1234-123456789012",
  "name": "My Snapchat Campaign",
  "status": "ACTIVE",
  "objective": "AWARENESS",
  "dailyBudget": 5000000, // Optional, in micro-currency
  "lifetimeBudget": 50000000, // Optional, in micro-currency
  "startTime": "2023-01-01T00:00:00Z", // Optional
  "endTime": "2023-12-31T23:59:59Z" // Optional
}
```

### Create a Creative

```javascript
{
  "action": "create_creative",
  "token": "your-snapchat-api-token",
  "adAccountId": "12345678-1234-1234-1234-123456789012",
  "name": "My Snapchat Creative",
  "type": "WEB_VIEW", // Options: WEB_VIEW, APP_INSTALL
  "brandName": "My Brand",
  "headline": "Check out our product!",
  "topSnapMediaId": "12345678-1234-1234-1234-123456789012",
  "webViewUrl": "https://example.com", // Required for WEB_VIEW type
  "appInstallUrl": "https://example.com/app", // Required for APP_INSTALL type
  "callToAction": "SHOP_NOW" // Optional
}
```

### Get Ads

```javascript
{
  "action": "get_ads",
  "token": "your-snapchat-api-token",
  "adAccountId": "12345678-1234-1234-1234-123456789012",
  "campaignId": "12345678-1234-1234-1234-123456789012", // Optional, to filter by campaign
  "status": "ACTIVE", // Optional, options: ACTIVE, PAUSED, COMPLETED
  "maxResults": 50 // Optional, default: 50
}
```

### Get Campaigns

```javascript
{
  "action": "get_campaigns",
  "token": "your-snapchat-api-token",
  "adAccountId": "12345678-1234-1234-1234-123456789012",
  "status": "ACTIVE", // Optional, options: ACTIVE, PAUSED, COMPLETED
  "maxResults": 50 // Optional, default: 50
}
```

### Get Ad Accounts

```javascript
{
  "action": "get_ad_accounts",
  "token": "your-snapchat-api-token",
  "maxResults": 50 // Optional, default: 50
}
```

## Response Examples

### Create Ad Response

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "My Snapchat Ad",
  "status": "ACTIVE",
  "type": "SNAP_AD",
  "creativeUrl": "https://www.snapchat.com/ad/12345678-1234-1234-1234-123456789012",
  "startTime": "2023-01-01T00:00:00Z",
  "endTime": "2023-12-31T23:59:59Z",
  "dailyBudget": 1000000,
  "lifetimeBudget": 10000000,
  "impressions": 0,
  "swipes": 0,
  "spends": 0
}
```

### Create Campaign Response

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "My Snapchat Campaign",
  "status": "ACTIVE",
  "startTime": "2023-01-01T00:00:00Z",
  "endTime": "2023-12-31T23:59:59Z",
  "dailyBudget": 5000000,
  "lifetimeBudget": 50000000,
  "objective": "AWARENESS"
}
```

### Create Creative Response

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "My Snapchat Creative",
  "type": "WEB_VIEW",
  "status": "ACTIVE",
  "brandName": "My Brand",
  "headline": "Check out our product!",
  "topSnapMediaId": "12345678-1234-1234-1234-123456789012",
  "topSnapCropPosition": "CENTER",
  "webViewUrl": "https://example.com",
  "appInstallUrl": "",
  "callToAction": "SHOP_NOW"
}
```

### Get Ads Response

```json
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "name": "My Snapchat Ad",
    "status": "ACTIVE",
    "type": "SNAP_AD",
    "creativeUrl": "https://www.snapchat.com/ad/12345678-1234-1234-1234-123456789012",
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": "2023-12-31T23:59:59Z",
    "dailyBudget": 1000000,
    "lifetimeBudget": 10000000,
    "impressions": 1234,
    "swipes": 123,
    "spends": 500000
  }
]
```

### Get Campaigns Response

```json
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "name": "My Snapchat Campaign",
    "status": "ACTIVE",
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": "2023-12-31T23:59:59Z",
    "dailyBudget": 5000000,
    "lifetimeBudget": 50000000,
    "objective": "AWARENESS"
  }
]
```

### Get Ad Accounts Response

```json
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "name": "My Ad Account",
    "type": "BUSINESS",
    "status": "ACTIVE",
    "currency": "USD",
    "timezone": "America/Los_Angeles",
    "advertiserId": "12345678-1234-1234-1234-123456789012",
    "organizationId": "12345678-1234-1234-1234-123456789012"
  }
]
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid access token
- Insufficient permissions
- API rate limits exceeded
- Invalid ad account, campaign, or creative IDs
- Resource not found

## Limitations

- Budget values must be provided in micro-currency (e.g., 1000000 = $1.00 USD)
- API rate limits apply as per Snapchat's policies
- Some actions require specific OAuth scopes
- Snapchat API may have restrictions on commercial usage

## Documentation

For more information about the Snapchat Marketing API, refer to the [official documentation](https://developers.snapchat.com/api/docs/).
