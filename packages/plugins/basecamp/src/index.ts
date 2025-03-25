import { createBasecampClient, BasecampConfig } from './common/client';
import { listProjects } from './actions/list-projects';
import { getProject } from './actions/get-project';
import { createProject } from './actions/create-project';
import { updateProject } from './actions/update-project';
import { listTodoLists } from './actions/list-todo-lists';
import { createTodoList } from './actions/create-todo-list';
import { listTodoItems } from './actions/list-todo-items';
import { createTodoItem } from './actions/create-todo-item';
import { updateTodoItem } from './actions/update-todo-item';
import { createMessage } from './actions/create-message';
import { listPeople } from './actions/list-people';
import { createScheduleEntry } from './actions/create-schedule-entry';
import { newTodoItem } from './triggers/new-todo-item';
import { newMessage } from './triggers/new-message';
import { newScheduleEntry } from './triggers/new-schedule-entry';

const basecampPlugin = {
  name: "basecamp",
  icon: "FaTrello",
  description: "Project management and team communication platform",
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
    getProject,
    createProject,
    updateProject,
    listTodoLists,
    createTodoList,
    listTodoItems,
    createTodoItem,
    updateTodoItem,
    createMessage,
    listPeople,
    createScheduleEntry,
  ],
  triggers: [
    newTodoItem,
    newMessage,
    newScheduleEntry,
  ],
};

export default basecampPlugin;
