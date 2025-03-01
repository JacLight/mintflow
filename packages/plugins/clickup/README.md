# ClickUp Plugin for MintFlow

This plugin provides integration with ClickUp, an all-in-one productivity platform for tasks, docs, goals, and projects.

## Features

- Create, retrieve, update, and delete tasks
- Manage task properties including assignees, status, priority, due dates, and more
- Support for custom fields and task templates
- Comprehensive error handling and response formatting

## Authentication

This plugin requires a ClickUp API Key for authentication. You can generate an API key in your ClickUp account under:

1. Profile Settings (click your avatar in the bottom left)
2. Apps
3. Generate API Token

## Usage

### Create Task

Create a new task in a ClickUp list.

```javascript
const result = await mintflow.plugins.clickup.create_task({
  apiKey: "pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  listId: "123456789",
  name: "New Task",
  description: "This is a new task created via the API",
  assignees: [12345678],
  status: "in progress",
  priority: 2,
  dueDate: 1672531200000, // Unix timestamp in milliseconds
  dueDateTime: true,
  tags: ["important", "project-x"]
});
```

### Get Task

Retrieve a task from ClickUp by ID.

```javascript
const result = await mintflow.plugins.clickup.get_task({
  apiKey: "pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  taskId: "123456789"
});
```

### Update Task

Update an existing task in ClickUp.

```javascript
const result = await mintflow.plugins.clickup.update_task({
  apiKey: "pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  taskId: "123456789",
  name: "Updated Task Name",
  status: "complete",
  priority: 1
});
```

### Delete Task

Delete a task from ClickUp.

```javascript
const result = await mintflow.plugins.clickup.delete_task({
  apiKey: "pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  taskId: "123456789"
});
```

## API Documentation

For more information about the ClickUp API, please refer to the [official documentation](https://clickup.com/api).

## Task Priority Values

When setting task priorities, use the following values:

- 1: Urgent
- 2: High
- 3: Normal
- 4: Low

## Custom Fields

To set custom fields on a task, provide an array of objects with the field ID and value:

```javascript
customFields: [
  {
    id: "0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
    value: "Custom field value"
  }
]
```

The format of the value depends on the type of custom field. Refer to the ClickUp API documentation for specific field types.
