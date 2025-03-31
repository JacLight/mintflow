import { createBasecampClient, BasecampConfig } from './common/client.js';
import { listProjects } from './actions/list-projects.js';
import { createProject } from './actions/create-project.js';
import { createTodoItem } from './actions/create-todo-item.js';
import { newTodoItem } from './triggers/new-todo-item.js';


const basecampPlugin = {
  name: "basecamp",
  icon: "FaTrello",
  description: "Project management and team communication platform",
  groups: ["productivity"],
  tags: ["productivity", "collaboration", "organization", "workflow", "task"],
  version: '1.0.0',
  id: "basecamp",
  runner: "node",
  auth: {
    required: true,
    schema: {
      type: "object",
      properties: {
        account_id: {
          type: "string",
          description: "Your Basecamp account ID (found in the URL)",
          required: true,
        },
        access_token: {
          type: "string",
          description: "Your Basecamp access token",
          required: true,
          format: "password",
        },
        user_agent: {
          type: "string",
          description: "User agent string (required by Basecamp API)",
          required: true,
          default: "MintFlow Basecamp Plugin (your-email@example.com)",
        },
      },
    },
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  outputSchema: {
    type: "object",
    properties: {},
  },
  exampleInput: {},
  exampleOutput: {},
  documentation: "https://github.com/basecamp/bc3-api",
  method: "exec",
  actions: [
    listProjects,
    createProject,
    createTodoItem,
    // getProject,
    // updateProject,
    // listTodoLists,
    // createTodoList,
    // listTodoItems,
    // updateTodoItem,
    // createMessage,
    // listPeople,
    // createScheduleEntrt,
  ],
  triggers: [
    newTodoItem,
    // newMessage,
    // newScheduleEntry,
  ],
};

export default basecampPlugin;
