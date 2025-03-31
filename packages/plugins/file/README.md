# MintFlow File Plugin

The File plugin provides tools for reading, creating, and manipulating files with various encodings and formats. It allows you to work with files in your workflows, including reading file contents, creating new files, changing file encodings, and checking file types.

## Features

- **Read File**: Read file contents in text or base64 format
- **Create File**: Create new files with specified content and encoding
- **Change File Encoding**: Convert files from one encoding to another
- **Check File Type**: Determine the MIME type of a file and check if it matches specified types
- Support for multiple encodings (UTF-8, ASCII, Base64, etc.)
- Support for detecting and checking various MIME types

## Installation

```bash
pnpm add @mintflow/file
```

## Usage

### Read File

This action reads a file and returns its contents in the specified format (text or base64).

```javascript
// Example usage in a workflow
const input = {
  data: {
    file: {
      name: "example.txt",
      data: Buffer.from("Hello, world!"),
      extension: "txt"
    }
  }
};

const config = {
  data: {
    outputFormat: "text" // or "base64"
  }
};

const result = await filePlugin.actions[0].execute(input, config);

// Result for text format:
// {
//   text: "Hello, world!",
//   fileName: "example.txt"
// }

// Result for base64 format:
// {
//   base64WithMimeType: "data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==",
//   base64: "SGVsbG8sIHdvcmxkIQ==",
//   fileName: "example.txt",
//   mimeType: "text/plain"
// }
```

#### Options

- **file**: The file to read (required)
- **outputFormat**: The format to return the file contents in (default: "text")
  - "text": Returns the file contents as a UTF-8 string
  - "base64": Returns the file contents as a base64-encoded string

### Create File

This action creates a new file with the specified content and encoding.

```javascript
// Example usage in a workflow
const input = {
  data: {
    content: "Hello, world!"
  }
};

const config = {
  data: {
    fileName: "example.txt",
    encoding: "utf8"
  }
};

const result = await filePlugin.actions[1].execute(input, config, context);

// Result:
// {
//   fileName: "example.txt",
//   url: "https://example.com/files/example.txt"
// }
```

#### Options

- **content**: The content to write to the file (required)
- **fileName**: The name of the file to create (required)
- **encoding**: The encoding to use for the file content (default: "utf8")

### Change File Encoding

This action changes the encoding of a file.

```javascript
// Example usage in a workflow
const input = {
  data: {
    file: {
      name: "example.txt",
      data: Buffer.from("Hello, world!"),
      extension: "txt"
    }
  }
};

const config = {
  data: {
    inputEncoding: "utf8",
    outputFileName: "example-base64.txt",
    outputEncoding: "base64"
  }
};

const result = await filePlugin.actions[2].execute(input, config, context);

// Result:
// {
//   url: "https://example.com/files/example-base64.txt",
//   fileName: "example-base64.txt",
//   encoding: "base64"
// }
```

#### Options

- **file**: The file to change the encoding of (required)
- **inputEncoding**: The current encoding of the file (default: "utf8")
- **outputFileName**: The name of the output file (required)
- **outputEncoding**: The encoding to convert to (default: "utf8")

### Check File Type

This action checks the MIME type of a file and determines if it matches a specified type.

```javascript
// Example usage in a workflow
const input = {
  data: {
    file: {
      name: "example.jpg",
      data: imageBuffer,
      extension: "jpg"
    }
  }
};

const config = {
  data: {
    mimeType: "image/jpeg"
  }
};

const result = await filePlugin.actions[3].execute(input, config);

// Result:
// {
//   mimeType: "image/jpeg",
//   isMatch: true
// }
```

#### Options

- **file**: The file to check (required)
- **mimeType**: The MIME type(s) to check against (required)

## Supported Encodings

- ASCII
- UTF-8
- UTF-16LE
- UCS-2
- Base64
- Base64 URL
- Latin1
- Binary
- Hex

## Example Workflow

```javascript
// Create a workflow that reads a file, changes its encoding, and checks its type
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "read_file"
    },
    {
      id: "read_file",
      type: "file",
      action: "read_file",
      data: {
        outputFormat: "text"
      },
      next: "change_encoding"
    },
    {
      id: "change_encoding",
      type: "file",
      action: "change_file_encoding",
      data: {
        inputEncoding: "utf8",
        outputFileName: "converted.txt",
        outputEncoding: "base64"
      },
      next: "check_type"
    },
    {
      id: "check_type",
      type: "file",
      action: "check_file_type",
      data: {
        mimeType: "text/plain"
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

## Notes

- When reading files, the plugin automatically detects the MIME type based on the file extension.
- When creating files, you can specify the encoding to use for the file content.
- When changing file encodings, the plugin first decodes the file using the input encoding, then encodes it using the output encoding.
- When checking file types, the plugin uses the file extension to determine the MIME type.

## License

MIT
