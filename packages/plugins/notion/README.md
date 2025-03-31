# Notion Plugin for MintFlow

This plugin provides integration with Notion, allowing you to interact with Notion databases, pages, and blocks.

## Features

- Create, update, and query database items
- Create pages and append content to existing pages
- Get children of pages or blocks
- List databases and pages

## Installation

```bash
npm install @mintflow/notion
```

## Usage

### Authentication

To use this plugin, you need a Notion API token. You can get one by creating an integration in the Notion developer portal:

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give your integration a name and select the workspace where you want to use it
4. Click "Submit" to create the integration
5. Copy the "Internal Integration Token"

You'll also need to share any databases or pages you want to access with your integration:

1. Open the database or page in Notion
2. Click the "Share" button in the top right
3. Click "Invite" and search for your integration name
4. Click "Invite"

### Examples

#### Create a Database Item

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "create_database_item",
    token: "your-notion-api-token",
    databaseId: "your-database-id",
    properties: {
      Name: "New Item",
      Status: "In Progress",
      Priority: "High"
    },
    content: "This is a new database item created with MintFlow."
  }
});
```

#### Update a Database Item

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "update_database_item",
    token: "your-notion-api-token",
    databaseId: "your-database-id",
    pageId: "your-page-id",
    properties: {
      Status: "Completed"
    }
  }
});
```

#### Find Database Items

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "find_database_items",
    token: "your-notion-api-token",
    databaseId: "your-database-id",
    filter: {
      property: "Status",
      select: {
        equals: "In Progress"
      }
    },
    sorts: [
      {
        property: "Priority",
        direction: "descending"
      }
    ]
  }
});
```

#### Create a Page

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "create_page",
    token: "your-notion-api-token",
    parentId: "your-parent-page-id",
    parentType: "page_id", // or "database_id"
    title: "New Page",
    content: "This is a new page created with MintFlow.",
    icon: "📝", // Optional emoji icon
    cover: "https://example.com/cover-image.jpg" // Optional cover image URL
  }
});
```

#### Append to a Page

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "append_to_page",
    token: "your-notion-api-token",
    pageId: "your-page-id",
    content: "This is appended content."
  }
});
```

#### Get Children of a Block

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "get_children",
    token: "your-notion-api-token",
    blockId: "your-block-id",
    pageSize: 100 // Optional
  }
});
```

#### Get Databases

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "get_databases",
    token: "your-notion-api-token"
  }
});
```

#### Get Pages

```javascript
const result = await mintflow.run({
  plugin: "notion",
  input: {
    action: "get_pages",
    token: "your-notion-api-token",
    editedAfter: "2023-01-01T00:00:00.000Z", // Optional
    sortDirection: "descending" // Optional
  }
});
```

## API Reference

### Actions

- `create_database_item`: Create a new item in a Notion database
- `update_database_item`: Update an existing item in a Notion database
- `find_database_items`: Find items in a Notion database
- `create_page`: Create a new page in Notion
- `append_to_page`: Append content to an existing page
- `get_children`: Get children of a page or block
- `get_databases`: Get a list of databases
- `get_pages`: Get a list of pages

### Parameters

#### Common Parameters

- `action`: The action to perform (required)
- `token`: Your Notion API token (required)

#### Action-Specific Parameters

##### create_database_item

- `databaseId`: The ID of the database (required)
- `properties`: The properties of the item (required)
- `content`: Content to add to the page (optional)

##### update_database_item

- `databaseId`: The ID of the database (required)
- `pageId`: The ID of the page to update (required)
- `properties`: The properties to update (required)

##### find_database_items

- `databaseId`: The ID of the database (required)
- `filter`: Filter for database query (optional)
- `sorts`: Sort options for database query (optional)
- `pageSize`: Number of results to return (optional)

##### create_page

- `parentId`: The ID of the parent (required)
- `parentType`: The type of parent (`database_id` or `page_id`) (required)
- `title`: The title of the page (required)
- `content`: Content to add to the page (optional)
- `icon`: Emoji icon for the page (optional)
- `cover`: Cover image URL for the page (optional)

##### append_to_page

- `pageId`: The ID of the page (required)
- `content`: Content to append (required)

##### get_children

- `blockId`: The ID of the block (required)
- `pageSize`: Number of results to return (optional)
- `startCursor`: Cursor for pagination (optional)

##### get_pages

- `editedAfter`: Get pages edited after this date (ISO format) (optional)
- `createdAfter`: Get pages created after this date (ISO format) (optional)
- `sortProperty`: Property to sort by (optional)
- `sortDirection`: Sort direction (`ascending` or `descending`) (optional)

## Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion API Reference](https://developers.notion.com/reference)
