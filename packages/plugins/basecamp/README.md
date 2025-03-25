# Basecamp Plugin for MintFlow

This plugin provides integration with Basecamp, a project management and team communication platform.

## Features

- Create and manage projects
- Create and manage to-do lists and to-do items
- Create and manage messages
- Manage people and teams
- Schedule events and manage calendars
- Webhook triggers for real-time updates

## Authentication

To use this plugin, you need a Basecamp account and an access token. You can get an access token by:

1. Creating a Basecamp 3 account at [basecamp.com](https://basecamp.com/)
2. Creating an OAuth application at [integrate.37signals.com](https://integrate.37signals.com/)
3. Using the OAuth flow to get an access token

You'll also need your Basecamp account ID, which can be found in the URL when you're logged in to Basecamp (e.g., `https://3.basecamp.com/1234567` where `1234567` is your account ID).

## Actions

### List Projects

List all projects in your Basecamp account.

**Output:**

- `projects`: Array of projects with their details

### Get Project

Get details about a specific project.

**Input Parameters:**

- `projectId` (required): The ID of the project

**Output:**

- `project`: Project details

### Create Project

Create a new project in Basecamp.

**Input Parameters:**

- `name` (required): The name of the project
- `description` (optional): The description of the project

**Output:**

- `project`: Created project details

### Update Project

Update an existing project in Basecamp.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `name` (required): The new name of the project
- `description` (optional): The new description of the project

**Output:**

- `project`: Updated project details

### List To-do Lists

List all to-do lists in a project.

**Input Parameters:**

- `projectId` (required): The ID of the project

**Output:**

- `todoLists`: Array of to-do lists with their details

### Create To-do List

Create a new to-do list in a project.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `name` (required): The name of the to-do list
- `description` (optional): The description of the to-do list

**Output:**

- `todoList`: Created to-do list details

### List To-do Items

List all to-do items in a to-do list.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `todoListId` (required): The ID of the to-do list

**Output:**

- `todoItems`: Array of to-do items with their details

### Create To-do Item

Create a new to-do item in a to-do list.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `todoListId` (required): The ID of the to-do list
- `content` (required): The content of the to-do item
- `description` (optional): The description of the to-do item
- `assigneeIds` (optional): Array of IDs of people to assign to the to-do item
- `dueOn` (optional): The due date of the to-do item (YYYY-MM-DD)

**Output:**

- `todoItem`: Created to-do item details

### Update To-do Item

Update an existing to-do item in a to-do list.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `todoListId` (required): The ID of the to-do list
- `todoId` (required): The ID of the to-do item
- `content` (optional): The new content of the to-do item
- `description` (optional): The new description of the to-do item
- `assigneeIds` (optional): Array of IDs of people to assign to the to-do item
- `dueOn` (optional): The new due date of the to-do item (YYYY-MM-DD)
- `completed` (optional): Whether the to-do item is completed

**Output:**

- `todoItem`: Updated to-do item details

### Create Message

Create a new message in a project's message board.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `messageBoardId` (required): The ID of the message board
- `subject` (required): The subject of the message
- `content` (required): The content of the message

**Output:**

- `message`: Created message details

### List People

List all people in your Basecamp account.

**Output:**

- `people`: Array of people with their details

### Create Schedule Entry

Create a new schedule entry in a project's schedule.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `scheduleId` (required): The ID of the schedule
- `summary` (required): The summary of the schedule entry
- `description` (optional): The description of the schedule entry
- `startsAt` (optional): The start date and time of the schedule entry (ISO 8601)
- `endsAt` (optional): The end date and time of the schedule entry (ISO 8601)
- `allDay` (optional): Whether the schedule entry is an all-day event

**Output:**

- `scheduleEntry`: Created schedule entry details

## Triggers

### New To-do Item

Triggered when a new to-do item is created in a Basecamp to-do list.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `todoListId` (required): The ID of the to-do list
- `webhookUrl` (required): The URL to send webhook events to

**Output:**

- `todoItem`: The created to-do item
- `creator`: The person who created the to-do item

### New Message

Triggered when a new message is created in a Basecamp message board.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `messageBoardId` (required): The ID of the message board
- `webhookUrl` (required): The URL to send webhook events to

**Output:**

- `message`: The created message
- `creator`: The person who created the message

### New Schedule Entry

Triggered when a new schedule entry is created in a Basecamp schedule.

**Input Parameters:**

- `projectId` (required): The ID of the project
- `scheduleId` (required): The ID of the schedule
- `webhookUrl` (required): The URL to send webhook events to

**Output:**

- `scheduleEntry`: The created schedule entry
- `creator`: The person who created the schedule entry

## Example Usage

```javascript
// List all projects in Basecamp
const projects = await mintflow.execute('basecamp', 'list-projects', {}, {
  auth: {
    account_id: '1234567',
    access_token: 'your-access-token',
    user_agent: 'MintFlow Basecamp Plugin (your-email@example.com)'
  }
});

// Create a new project
const project = await mintflow.execute('basecamp', 'create-project', {
  name: 'New Project',
  description: 'A new project created with MintFlow'
}, {
  auth: {
    account_id: '1234567',
    access_token: 'your-access-token',
    user_agent: 'MintFlow Basecamp Plugin (your-email@example.com)'
  }
});

// Create a new to-do list in the project
const todoList = await mintflow.execute('basecamp', 'create-todo-list', {
  projectId: project.project.id,
  name: 'Tasks',
  description: 'Tasks for the new project'
}, {
  auth: {
    account_id: '1234567',
    access_token: 'your-access-token',
    user_agent: 'MintFlow Basecamp Plugin (your-email@example.com)'
  }
});

// Create a new to-do item in the to-do list
const todoItem = await mintflow.execute('basecamp', 'create-todo-item', {
  projectId: project.project.id,
  todoListId: todoList.todoList.id,
  content: 'Complete the project',
  description: 'This is the first task for the new project',
  dueOn: '2025-12-31'
}, {
  auth: {
    account_id: '1234567',
    access_token: 'your-access-token',
    user_agent: 'MintFlow Basecamp Plugin (your-email@example.com)'
  }
});
```

## API Documentation

For more information about the Basecamp API, refer to the [official documentation](https://github.com/basecamp/bc3-api).
