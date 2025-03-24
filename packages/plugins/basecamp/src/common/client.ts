import axios, { AxiosInstance } from 'axios';

export interface BasecampConfig {
  account_id: string;
  access_token: string;
  user_agent: string;
}

export class BasecampClient {
  private client: AxiosInstance;
  private accountId: string;

  constructor(config: BasecampConfig) {
    this.accountId = config.account_id;
    this.client = axios.create({
      baseURL: `https://3.basecampapi.com/${config.account_id}`,
      headers: {
        'Authorization': `Bearer ${config.access_token}`,
        'User-Agent': config.user_agent,
        'Content-Type': 'application/json',
      },
    });
  }

  // Projects
  async listProjects() {
    const response = await this.client.get('/projects.json');
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}.json`);
    return response.data;
  }

  async createProject(name: string, description?: string) {
    const response = await this.client.post('/projects.json', {
      name,
      description,
    });
    return response.data;
  }

  async updateProject(projectId: string, name: string, description?: string) {
    const response = await this.client.put(`/projects/${projectId}.json`, {
      name,
      description,
    });
    return response.data;
  }

  // To-do lists
  async listTodoLists(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}/todolists.json`);
    return response.data;
  }

  async getTodoList(projectId: string, todoListId: string) {
    const response = await this.client.get(`/projects/${projectId}/todolists/${todoListId}.json`);
    return response.data;
  }

  async createTodoList(projectId: string, name: string, description?: string) {
    const response = await this.client.post(`/projects/${projectId}/todolists.json`, {
      name,
      description,
    });
    return response.data;
  }

  // To-do items
  async listTodoItems(projectId: string, todoListId: string) {
    const response = await this.client.get(`/projects/${projectId}/todolists/${todoListId}/todos.json`);
    return response.data;
  }

  async getTodoItem(projectId: string, todoListId: string, todoId: string) {
    const response = await this.client.get(`/projects/${projectId}/todolists/${todoListId}/todos/${todoId}.json`);
    return response.data;
  }

  async createTodoItem(projectId: string, todoListId: string, content: string, description?: string, assigneeIds?: string[], dueOn?: string) {
    const payload: any = {
      content,
      description,
    };

    if (assigneeIds && assigneeIds.length > 0) {
      payload.assignee_ids = assigneeIds;
    }

    if (dueOn) {
      payload.due_on = dueOn;
    }

    const response = await this.client.post(`/projects/${projectId}/todolists/${todoListId}/todos.json`, payload);
    return response.data;
  }

  async updateTodoItem(projectId: string, todoListId: string, todoId: string, content?: string, description?: string, assigneeIds?: string[], dueOn?: string, completed?: boolean) {
    const payload: any = {};

    if (content) {
      payload.content = content;
    }

    if (description !== undefined) {
      payload.description = description;
    }

    if (assigneeIds) {
      payload.assignee_ids = assigneeIds;
    }

    if (dueOn !== undefined) {
      payload.due_on = dueOn;
    }

    if (completed !== undefined) {
      payload.completed = completed;
    }

    const response = await this.client.put(`/projects/${projectId}/todolists/${todoListId}/todos/${todoId}.json`, payload);
    return response.data;
  }

  // Message boards
  async listMessageBoards(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}/message_boards.json`);
    return response.data;
  }

  async getMessageBoard(projectId: string, messageBoardId: string) {
    const response = await this.client.get(`/projects/${projectId}/message_boards/${messageBoardId}.json`);
    return response.data;
  }

  // Messages
  async listMessages(projectId: string, messageBoardId: string) {
    const response = await this.client.get(`/projects/${projectId}/message_boards/${messageBoardId}/messages.json`);
    return response.data;
  }

  async getMessage(projectId: string, messageBoardId: string, messageId: string) {
    const response = await this.client.get(`/projects/${projectId}/message_boards/${messageBoardId}/messages/${messageId}.json`);
    return response.data;
  }

  async createMessage(projectId: string, messageBoardId: string, subject: string, content: string) {
    const response = await this.client.post(`/projects/${projectId}/message_boards/${messageBoardId}/messages.json`, {
      subject,
      content,
    });
    return response.data;
  }

  // People
  async listPeople() {
    const response = await this.client.get('/people.json');
    return response.data;
  }

  async getPerson(personId: string) {
    const response = await this.client.get(`/people/${personId}.json`);
    return response.data;
  }

  // Schedule
  async listSchedules(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}/schedules.json`);
    return response.data;
  }

  async getSchedule(projectId: string, scheduleId: string) {
    const response = await this.client.get(`/projects/${projectId}/schedules/${scheduleId}.json`);
    return response.data;
  }

  // Schedule entries
  async listScheduleEntries(projectId: string, scheduleId: string) {
    const response = await this.client.get(`/projects/${projectId}/schedules/${scheduleId}/entries.json`);
    return response.data;
  }

  async getScheduleEntry(projectId: string, scheduleId: string, entryId: string) {
    const response = await this.client.get(`/projects/${projectId}/schedules/${scheduleId}/entries/${entryId}.json`);
    return response.data;
  }

  async createScheduleEntry(projectId: string, scheduleId: string, summary: string, description?: string, startsAt?: string, endsAt?: string, allDay?: boolean) {
    const payload: any = {
      summary,
    };

    if (description) {
      payload.description = description;
    }

    if (startsAt) {
      payload.starts_at = startsAt;
    }

    if (endsAt) {
      payload.ends_at = endsAt;
    }

    if (allDay !== undefined) {
      payload.all_day = allDay;
    }

    const response = await this.client.post(`/projects/${projectId}/schedules/${scheduleId}/entries.json`, payload);
    return response.data;
  }

  // Webhooks
  async listWebhooks() {
    const response = await this.client.get('/webhooks.json');
    return response.data;
  }

  async createWebhook(payload: {
    active: boolean;
    url: string;
    types: string[];
  }) {
    const response = await this.client.post('/webhooks.json', payload);
    return response.data;
  }

  async deleteWebhook(webhookId: string) {
    const response = await this.client.delete(`/webhooks/${webhookId}.json`);
    return response.data;
  }
}

export function createBasecampClient(config: BasecampConfig): BasecampClient {
  return new BasecampClient(config);
}
