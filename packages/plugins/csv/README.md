# MintFlow CSV Plugin

The CSV plugin provides tools to convert between CSV and JSON formats in your workflows. It allows you to easily transform data between these formats for integration with various systems and APIs.

## Features

- **Convert CSV to JSON**: Transform CSV text into a JSON array
- **Convert JSON to CSV**: Transform a JSON array into CSV text
- Support for CSV with or without headers
- Support for different delimiters (comma, tab)
- Automatic flattening of nested JSON objects

## Installation

```bash
pnpm add @mintflow/csv
```

## Usage

### Convert CSV to JSON

This action converts CSV text into a JSON array.

```javascript
// Example usage in a workflow
const input = {
  data: {
    csvText: `name,age,email
John Doe,30,john@example.com
Jane Smith,25,jane@example.com`
  }
};

const config = {
  data: {
    hasHeaders: true,
    delimiter: ','
  }
};

const result = await csvPlugin.actions[0].execute(input, config);

// Result:
// {
//   result: [
//     {
//       name: 'John Doe',
//       age: '30',
//       email: 'john@example.com'
//     },
//     {
//       name: 'Jane Smith',
//       age: '25',
//       email: 'jane@example.com'
//     }
//   ]
// }
```

#### Options

- **csvText**: The CSV text to convert (required)
- **hasHeaders**: Whether the CSV has headers (default: false)
- **delimiter**: The delimiter used in the CSV (default: ',')

### Convert JSON to CSV

This action converts a JSON array into CSV text.

```javascript
// Example usage in a workflow
const input = {
  data: {
    jsonArray: [
      {
        name: 'John Doe',
        age: 30,
        contact: {
          email: 'john@example.com',
          phone: '555-1234'
        }
      },
      {
        name: 'Jane Smith',
        age: 25,
        contact: {
          email: 'jane@example.com',
          phone: '555-5678'
        }
      }
    ]
  }
};

const config = {
  data: {
    delimiter: ','
  }
};

const result = await csvPlugin.actions[1].execute(input, config);

// Result:
// {
//   result: 'name,age,contact.email,contact.phone\nJohn Doe,30,john@example.com,555-1234\nJane Smith,25,jane@example.com,555-5678'
// }
```

#### Options

- **jsonArray**: The JSON array to convert (required)
- **delimiter**: The delimiter to use in the CSV (default: ',')

## Example Workflow

```javascript
// Create a workflow that reads a CSV file and transforms it to JSON
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "read_csv_file"
    },
    {
      id: "read_csv_file",
      type: "fetch",
      action: "get",
      data: {
        url: "https://example.com/data.csv"
      },
      next: "convert_to_json"
    },
    {
      id: "convert_to_json",
      type: "csv",
      action: "csv_to_json",
      data: {
        hasHeaders: true,
        delimiter: ","
      },
      next: "process_data"
    },
    {
      id: "process_data",
      type: "...",
      // Process the JSON data
    }
  ]
};
```

## Notes

- When converting CSV to JSON with headers, the headers are used as property names in the resulting JSON objects.
- When converting JSON to CSV, nested objects are flattened using dot notation (e.g., `contact.email`).
- All values in the CSV are treated as strings when converting to JSON.

## License

MIT
