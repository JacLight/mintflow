# MintFlow Authorize Plugin

The Authorize plugin allows you to build authorization processes in your workflows. It provides functionality to create authorization links and pause workflow execution until authorization is received.

## Features

- Create authorization links that can be sent to users for approval or rejection
- Pause workflow execution until authorization is received
- Continue workflow execution based on the authorization decision

## Installation

```bash
pnpm add @mintflow/authorize
```

## Usage

### Create Authorization Links

This action generates authorization and rejection links that can be sent to users.

```javascript
// Example usage in a workflow
const result = await authorize.create_authorization_links(input, config);

// Result contains:
// {
//   authorizeLink: "https://example.com/authorize?action=authorize",
//   rejectLink: "https://example.com/authorize?action=reject"
// }
```

### Wait for Authorization

This action pauses the workflow execution and waits for authorization. The workflow will resume when one of the authorization links is clicked.

```javascript
// Example usage in a workflow
const result = await authorize.wait_for_authorization(input, config);

// Result contains:
// {
//   ...input.data,
//   authorized: true | false  // true if authorized, false if rejected
// }
```

## Example Workflow

```javascript
// Create a workflow that requires authorization
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "create_links"
    },
    {
      id: "create_links",
      type: "authorize",
      action: "create_authorization_links",
      next: "send_email"
    },
    {
      id: "send_email",
      type: "mail",
      action: "send",
      data: {
        to: "user@example.com",
        subject: "Authorization Required",
        body: "Please authorize this action by clicking here: {{data.authorizeLink}}\n\nOr reject by clicking here: {{data.rejectLink}}"
      },
      next: "wait_for_authorization"
    },
    {
      id: "wait_for_authorization",
      type: "authorize",
      action: "wait_for_authorization",
      next: "check_authorization"
    },
    {
      id: "check_authorization",
      type: "switch",
      data: {
        source: "data",
        key: "authorized",
        options: [
          {
            label: "Authorized",
            operation: "equal",
            value: "true",
            next: "process_authorized"
          },
          {
            label: "Rejected",
            operation: "equal",
            value: "false",
            next: "process_rejected"
          }
        ]
      }
    },
    {
      id: "process_authorized",
      type: "...",
      // Process when authorized
    },
    {
      id: "process_rejected",
      type: "...",
      // Process when rejected
    }
  ]
};
```

## License

MIT
