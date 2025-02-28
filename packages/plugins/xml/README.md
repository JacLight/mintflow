# MintFlow XML Plugin

The XML plugin provides utilities for working with XML data, including conversion between XML and JSON, validation, and querying. It's designed to help you process XML data in your workflows, making it easy to integrate with XML-based APIs and data sources.

## Features

- **XML to JSON**: Convert XML strings to JSON objects
- **JSON to XML**: Convert JSON objects to XML strings
- **Validate XML**: Check if an XML string is well-formed
- **Query XML**: Extract data from XML using simple path expressions

## Installation

```bash
pnpm add @mintflow/xml
```

## Usage

### Convert XML to JSON

This action converts an XML string to a JSON object.

```javascript
// Example usage in a workflow
const input = {
  data: {
    xml: '<root><person><name>John</name><age>30</age></person></root>',
    preserveOrder: false,
    ignoreAttributes: false
  }
};

const result = await xmlPlugin.actions[0].execute(input, {}, {});

// Result:
// {
//   result: {
//     root: {
//       person: {
//         name: 'John',
//         age: 30
//       }
//     }
//   }
// }
```

#### Options

- **xml**: The XML string to convert (required)
- **preserveOrder**: Whether to preserve the order of elements (optional, default: false)
- **ignoreAttributes**: Whether to ignore XML attributes (optional, default: false)

### Convert JSON to XML

This action converts a JSON object to an XML string.

```javascript
// Example usage in a workflow
const input = {
  data: {
    json: {
      person: {
        name: 'John',
        age: 30
      }
    },
    rootName: 'root',
    format: true
  }
};

const result = await xmlPlugin.actions[1].execute(input, {}, {});

// Result:
// {
//   xml: '<root>\n  <person>\n    <name>John</name>\n    <age>30</age>\n  </person>\n</root>'
// }
```

#### Options

- **json**: The JSON object to convert (required)
- **rootName**: The name of the root XML element (optional, default: 'root')
- **format**: Whether to format the XML with indentation for readability (optional, default: false)
- **ignoreAttributes**: Whether to ignore XML attributes in the JSON object (optional, default: false)

### Validate XML

This action validates an XML string for well-formedness.

```javascript
// Example usage in a workflow
const input = {
  data: {
    xml: '<root><person><name>John</name><age>30</age></person></root>'
  }
};

const result = await xmlPlugin.actions[2].execute(input, {}, {});

// Result:
// {
//   valid: true
// }
```

#### Options

- **xml**: The XML string to validate (required)

### Query XML

This action extracts data from an XML string using a simple path expression.

```javascript
// Example usage in a workflow
const input = {
  data: {
    xml: '<root><person><name>John</name><age>30</age></person><person><name>Jane</name><age>25</age></person></root>',
    path: 'root.person'
  }
};

const result = await xmlPlugin.actions[3].execute(input, {}, {});

// Result:
// {
//   result: [
//     {
//       name: 'John',
//       age: 30
//     },
//     {
//       name: 'Jane',
//       age: 25
//     }
//   ]
// }
```

#### Options

- **xml**: The XML string to query (required)
- **path**: The path to the element(s) to extract (required)
- **ignoreAttributes**: Whether to ignore XML attributes (optional, default: false)

## Example Workflow

```javascript
// Create a workflow that processes an XML response from an API
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "fetch_data"
    },
    {
      id: "fetch_data",
      type: "fetch",
      action: "get",
      data: {
        url: "https://api.example.com/data.xml"
      },
      next: "validate_xml"
    },
    {
      id: "validate_xml",
      type: "xml",
      action: "validate_xml",
      data: {
        xml: "{{fetch_data.body}}"
      },
      next: "check_validation"
    },
    {
      id: "check_validation",
      type: "switch",
      data: {
        conditions: [
          {
            condition: "{{validate_xml.valid}}",
            next: "convert_to_json"
          },
          {
            condition: "true",
            next: "handle_error"
          }
        ]
      }
    },
    {
      id: "convert_to_json",
      type: "xml",
      action: "convert_xml_to_json",
      data: {
        xml: "{{fetch_data.body}}"
      },
      next: "query_data"
    },
    {
      id: "query_data",
      type: "xml",
      action: "query_xml",
      data: {
        xml: "{{fetch_data.body}}",
        path: "root.items.item"
      },
      next: "process_results"
    },
    {
      id: "process_results",
      type: "modify",
      data: {
        operations: [
          {
            type: "set",
            path: "$.items",
            value: "{{query_data.result}}"
          }
        ]
      },
      next: "end"
    },
    {
      id: "handle_error",
      type: "modify",
      data: {
        operations: [
          {
            type: "set",
            path: "$.error",
            value: "Invalid XML: {{validate_xml.error}}"
          }
        ]
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

All actions include comprehensive error handling:

- If required parameters are missing, the action will return an error message
- If XML parsing fails, the `convert_xml_to_json` action will return the parsing error
- If XML generation fails, the `convert_json_to_xml` action will return the error
- If XML validation fails, the `validate_xml` action will return the validation error
- If XML querying fails, the `query_xml` action will return the error

## Common Use Cases

- Processing XML responses from APIs
- Converting between XML and JSON formats
- Validating XML data before processing
- Extracting specific data from XML documents
- Generating XML for SOAP API requests
- Working with XML configuration files

## License

MIT
