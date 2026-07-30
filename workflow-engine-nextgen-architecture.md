# Next-Generation Workflow Engine Architecture

## Overview

This document describes the new architecture for the Mintflow workflow engine, moving from a plugin/entity-based model to a portable, snippet-driven, composable system. The new design maximizes portability, flexibility, and developer experience, while supporting both simple and advanced use cases.

---

## 1. Core Concepts

### Snippets

- **Definition**: Each workflow step is a standalone function ("snippet") with a consistent request/response contract, similar to HTTP APIs.
- **Interface**: 
  - Input: `request` object (arbitrary JSON)
  - Output: `response` object (arbitrary JSON)
- **Example**:
  ```js
  // add.js
  module.exports = async function(request) {
    const { a, b } = request;
    return { result: a + b };
  }
  ```

### Workflow Composition

- **Config**: Workflows are defined as a set of snippets, with the entry point specified.
- **Execution**: The entry point snippet is invoked, and it is responsible for calling other snippets as needed, just like a normal program. There is no enforced chaining by the engine; control flow is determined by the code in the entry snippet.
- **Portability**: The resulting workflow can run anywhere Node.js is available, with no external dependencies by default.

---

## 2. Triggers

- **Synchronous**: Direct invocation (e.g., CLI, API call).
- **Asynchronous**: Event-driven (e.g., webhooks, timers, scheduled jobs).
- **Embedded HTTP Server**: The workflow can start an HTTP server (using Express, Fastify, or Node.js http) to expose APIs or webhooks. This is implemented as a first-class snippet—users simply add an "HTTP" snippet to their project, provide minimal config, and all the necessary plumbing (routing, server lifecycle, etc.) is handled automatically.

---

## 3. State & Persistence

- **Default**: In-memory or file-based storage (e.g., SQLite, JSON files) for maximum portability.
- **External Stores**: Users can opt-in to use Redis, MongoDB, or other databases by simply adding a "SaveToDB", "Redis", or "MongoDB" snippet to their workflow and providing connection details in the config. All the hard plumbing (connection management, error handling, etc.) is handled by the engine and the snippet implementation.
- **Job Scheduling**: Use SQLite (or similar) to persist scheduled jobs, with an in-process scheduler (setInterval, node-cron) to trigger execution.

---

## 4. Extensibility

- **Adding New Snippets**: Developers can create new snippets by exporting a function with the standard contract.
- **First-Class Integrations**: Common infrastructure features (HTTP server, Redis, MongoDB, etc.) are provided as fully built, first-class snippets. Users simply add them to their workflow and provide minimal configuration; the engine handles all underlying complexity.
- **Custom Triggers**: Add new trigger types by extending the engine with additional listeners or event sources.

---

## 5. Comparison to Previous Architecture

| Aspect         | Current Model (Plugin/Entity)         | New Model (Snippet/Composable)         |
|----------------|--------------------------------------|----------------------------------------|
| Plugin System  | PluginDescriptor objects, actions     | Standalone snippet functions           |
| Workflow Config| Nodes reference plugins/actions       | Entry point snippet, programmatic flow |
| Engine         | Orchestrates plugins, manages state   | Runs entry snippet, no enforced chaining|
| Triggers       | Engine-driven, external APIs          | Embedded HTTP server, async/sync       |
| State          | Redis/KeyDB, external by default      | In-memory/file by default, external optional |
| Portability    | Requires server, plugins, infra       | Node.js only, single file, portable    |
| Extensibility  | Add plugins/actions                   | Add snippets, triggers, storage        |
| Infra Features | User must wire up infra manually      | First-class snippets, auto-plumbed     |

---

## 6. Example Workflow Config

```json
{
  "name": "Add and Store",
  "entry": "main",
  "snippets": [
    { "name": "HTTP", "config": { "port": 3000 } },
    { "name": "SaveToDB", "config": { "type": "mongo", "uri": "mongodb://..." } }
  ]
}
```

**main.js**
```js
const add = require('./add');
const saveToDB = require('./SaveToDB');
const http = require('./HTTP'); // First-class HTTP server snippet

module.exports = async function main(request) {
  await http(); // Starts the HTTP server with pre-configured routes
  const sum = await add({ a: 1, b: 2 });
  await saveToDB({ collection: 'results', data: sum.result });
  return { status: 'done' };
}
```

---

## 7. Advanced Usage

- **External Databases**: 
  - Add a "SaveToDB", "Redis", or "MongoDB" snippet.
  - Provide connection details in the config.
  - All connection and error handling is managed by the snippet/engine.
- **Scheduling**: 
  - Use SQLite to persist jobs.
  - Scheduler loop checks for due jobs and executes them.
- **API Exposure**: 
  - Include the "HTTP" snippet to expose workflow as an API, with all routing and server management handled for you.

---

## 8. Migration Path

1. Refactor existing actions to standalone snippets.
2. Update workflow configs to specify entry point and programmatic flow.
3. Refactor engine to run workflows as single Node.js executables.
4. Provide compatibility layer for legacy plugins if needed.

---

## 9. Benefits

- Highly portable and easy to deploy.
- Simple, composable, and testable workflow steps.
- Flexible triggers and state management.
- Extensible for advanced use cases.
- Maximum flexibility: control flow is just JavaScript/TypeScript.
- First-class, easy-to-use infrastructure features (HTTP, DB, etc.) with all plumbing handled.

---

## 10. Notes

- By default, no external dependencies are required.
- Advanced users can opt-in to external services as needed.
- All snippets must document their request/response contract for interoperability.

---

## 11. Control Flow and Chaining

### How Control Flow Works

- The workflow engine only sets the entry point (e.g., `main`).
- The entry snippet is responsible for calling other snippets/functions as needed, just like a normal program.
- There is no enforced chaining or orchestration by the engine; all logic is defined by the user in code.
- This allows for arbitrary, dynamic, and highly flexible workflows, including loops, conditionals, branching, and error handling.
- First-class snippets (HTTP, SaveToDB, etc.) are as easy to use as any other snippet, with all underlying complexity handled for the user.

### Example (Pseudo-code)

```js
// main.js
const stepA = require('./stepA');
const saveToDB = require('./SaveToDB');
const http = require('./HTTP');

module.exports = async function main(request) {
  await http();
  const resultA = await stepA(request);
  await saveToDB({ data: resultA });
  return resultA;
}
```

---
