# Webflow Plugin for MintFlow

This plugin provides integration with Webflow, a visual web design platform that allows you to build responsive websites without coding.

## Features

- Create, retrieve, update, and delete collection items
- Manage collection item properties including custom fields
- Support for draft and archived states
- Comprehensive error handling and response formatting

## Authentication

This plugin requires a Webflow API access token for authentication. You can generate an API token in your Webflow account under:

1. Account Settings
2. Workspace Settings
3. Integrations
4. Generate API Token

## Usage

### Create Collection Item

Create a new item in a Webflow collection.

```javascript
const result = await mintflow.plugins.webflow.create_collection_item({
  accessToken: "your-webflow-access-token",
  collectionId: "5f74f169c917b42f5bdb8988",
  fields: {
    name: "New Collection Item",
    slug: "new-collection-item",
    "custom-field": "Custom value"
  },
  isDraft: false,
  isArchived: false
});
```

### Get Collection Item

Retrieve a specific item from a Webflow collection.

```javascript
const result = await mintflow.plugins.webflow.get_collection_item({
  accessToken: "your-webflow-access-token",
  collectionId: "5f74f169c917b42f5bdb8988",
  itemId: "5f74f169c917b42f5bdb8989"
});
```

### Update Collection Item

Update an existing item in a Webflow collection.

```javascript
const result = await mintflow.plugins.webflow.update_collection_item({
  accessToken: "your-webflow-access-token",
  collectionId: "5f74f169c917b42f5bdb8988",
  itemId: "5f74f169c917b42f5bdb8989",
  fields: {
    name: "Updated Collection Item",
    "custom-field": "Updated value"
  },
  isDraft: false,
  isArchived: false
});
```

### Delete Collection Item

Delete an item from a Webflow collection.

```javascript
const result = await mintflow.plugins.webflow.delete_collection_item({
  accessToken: "your-webflow-access-token",
  collectionId: "5f74f169c917b42f5bdb8988",
  itemId: "5f74f169c917b42f5bdb8989"
});
```

## API Documentation

For more information about the Webflow API, please refer to the [official documentation](https://developers.webflow.com/).

## Collection Fields

When working with collection items, you need to provide the fields according to the collection's schema. The field names should match the slug of the fields in your Webflow collection.

Common fields include:

- `name`: The name of the collection item (required)
- `slug`: The slug of the collection item (auto-generated if not provided)
- Custom fields: Any custom fields defined in your collection

## System Fields

The following system fields can be controlled when creating or updating collection items:

- `isDraft`: Whether the item is a draft (not published)
- `isArchived`: Whether the item is archived

## Error Handling

All actions return an `error` property if the operation fails. You can check for this property to handle errors in your workflow:

```javascript
if (result.error) {
  console.error(`Operation failed: ${result.error}`);
} else {
  console.log('Operation succeeded!');
}
