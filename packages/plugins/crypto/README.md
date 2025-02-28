# MintFlow Crypto Plugin

The Crypto plugin provides cryptographic utilities for hashing text, generating HMAC signatures, and creating random passwords. It's designed to help you secure your data and implement cryptographic operations in your workflows.

## Features

- **Text to Hash**: Convert text to hash values using various algorithms (MD5, SHA1, SHA256, SHA512, SHA3-512)
- **HMAC Signature**: Generate HMAC signatures with secret keys and various hashing algorithms
- **Password Generation**: Create random passwords with configurable length and character sets

## Installation

```bash
pnpm add @mintflow/crypto
```

## Usage

### Text to Hash

This action converts text to a hash value using various hashing algorithms.

```javascript
// Example usage in a workflow
const input = {
  data: {
    text: "Hello, world!",
    method: "sha256"
  }
};

const result = await cryptoPlugin.actions[0].execute(input, {}, {});

// Result:
// {
//   hash: "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"
// }
```

#### Options

- **text**: The text to be hashed (required)
- **method**: The hashing algorithm to use (required)
  - Supported methods: `md5`, `sha1`, `sha256`, `sha512`, `sha3-512`

### Generate HMAC Signature

This action generates an HMAC signature for text using a secret key and various hashing algorithms.

```javascript
// Example usage in a workflow
const input = {
  data: {
    text: "Hello, world!",
    method: "sha256",
    secretKey: "my-secret-key",
    secretKeyEncoding: "utf-8"
  }
};

const result = await cryptoPlugin.actions[1].execute(input, {}, {});

// Result:
// {
//   signature: "2f7c0a9d3f3bd4c9ba4d9e1c6a1b7a9d3f3bd4c9ba4d9e1c6a1b7a9d3f3bd4c9"
// }
```

#### Options

- **text**: The text to be signed (required)
- **method**: The hashing algorithm to use (required)
  - Supported methods: `md5`, `sha1`, `sha256`, `sha512`
- **secretKey**: The secret key to use for signing (required)
- **secretKeyEncoding**: The encoding of the secret key (optional, default: `utf-8`)
  - Supported encodings: `utf-8`, `hex`, `base64`

### Generate Password

This action generates a random password with the specified length and character set.

```javascript
// Example usage in a workflow
const input = {
  data: {
    length: 16,
    characterSet: "alphanumeric"
  }
};

const result = await cryptoPlugin.actions[2].execute(input, {}, {});

// Result:
// {
//   password: "a1B2c3D4e5F6g7H8"
// }
```

#### Options

- **length**: The length of the password (required, maximum 256)
- **characterSet**: The character set to use (optional, default: `alphanumeric`)
  - `alphanumeric`: Includes lowercase and uppercase letters, and numbers
  - `alphanumeric-symbols`: Includes lowercase and uppercase letters, numbers, and special symbols

## Example Workflow

```javascript
// Create a workflow that hashes a password, generates an HMAC signature, and creates a new password
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "hash_password"
    },
    {
      id: "hash_password",
      type: "crypto",
      action: "hash_text",
      data: {
        text: "{{input.password}}",
        method: "sha256"
      },
      next: "generate_hmac"
    },
    {
      id: "generate_hmac",
      type: "crypto",
      action: "hmac_signature",
      data: {
        text: "{{input.message}}",
        method: "sha256",
        secretKey: "{{secrets.apiKey}}",
        secretKeyEncoding: "utf-8"
      },
      next: "generate_new_password"
    },
    {
      id: "generate_new_password",
      type: "crypto",
      action: "generate_password",
      data: {
        length: 16,
        characterSet: "alphanumeric-symbols"
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

## Security Considerations

- The plugin uses Node.js's built-in `crypto` module for all cryptographic operations
- For production use, consider using stronger hashing algorithms (SHA256 or higher)
- HMAC signatures provide better security than plain hashes when a secret key is available
- Generated passwords are created using a cryptographically secure random number generator

## License

MIT
