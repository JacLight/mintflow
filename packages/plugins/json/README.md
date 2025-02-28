# MintFlow JSON Plugin

The JSON plugin provides utilities for converting between JSON objects and text strings. It's designed to help you work with JSON data in your workflows, making it easy to parse JSON text or stringify JSON objects.

## Features

- **Text to JSON**: Convert text strings containing JSON to JSON objects
- **JSON to Text**: Convert JSON objects to text strings, with optional pretty printing

## Installation

```bash
pnpm add @mintflow/json
```

## Usage

### Convert Text to JSON

This action converts a text string containing JSON to a JSON object.

```javascript
// Example usage in a workflow
const input = {
  data: {
    text: '{"name": "John", "age": 30, "city": "New York"}'
  }
};

const result = await jsonPlugin.actions[0].execute(input, {}, {});

// Result:
// {
//   result: {
//     name: "John",
//     age: 30,
//     city: "New York"
//   }
// }
```

#### Options

- **text**: The text string containing JSON to convert (required)

### Convert JSON to Text

This action converts a JSON object to a text string.

```javascript
// Example usage in a workflow
const input = {
  data: {
    json: {
      name: "John",
      age: 30,
      city: "New York"
    },
    pretty: true
  }
};

const result = await jsonPlugin.actions[1].execute(input, {}, {});

// Result:
// {
//   text: '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}'
// }
```

#### Options

- **json**: The JSON object to convert to text (required)
- **pretty**: Whether to format the JSON with indentation for readability (optional, default: false)

## Example Workflow

```javascript
// Create a workflow that parses a JSON string and then converts it back to text
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "parse_json"
    },
    {
      id: "parse_json",
      type: "json",
      action: "convert_text_to_json",
      data: {
        text: '{"name": "John", "age": 30, "city": "New York"}'
      },
      next: "modify_data"
    },
    {
      id: "modify_data",
      type: "modify",
      data: {
        operations: [
          {
            type: "set",
            path: "$.result.age",
            value: 31
          }
        ]
      },
      next: "stringify_json"
    },
    {
      id: "stringify_json",
      type: "json",
      action: "convert_json_to_text",
      data: {
        json: "{{parse_json.result}}",
        pretty: true
      },
      next: "end"
    },
    {
      id: "end",
      type: "end"
    }
  ]
};
```

## Error Handling

Both actions include comprehensive error handling:

- If required parameters are missing, the action will return an error message
- If JSON parsing fails, the `convert_text_to_json` action will return the parsing error
- If JSON stringification fails, the `convert_json_to_text` action will return the error

## Common Use Cases

- Parsing API responses that return JSON as text
- Preparing JSON data for storage or transmission
- Formatting JSON for display or logging
- Converting between different data formats via JSON

## License

MIT
