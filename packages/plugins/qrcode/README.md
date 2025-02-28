# QR Code Plugin for MintFlow

This plugin allows you to generate QR codes from text or URLs.

## Installation

```bash
npm install @mintflow/qrcode
```

## Actions

### text_to_qrcode

Converts text or URLs to QR codes.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| text | string | Yes | - | The text to convert to QR code |
| outputFormat | string | No | 'base64' | The format of the output QR code ('png' or 'base64') |
| errorCorrectionLevel | string | No | 'M' | The error correction level of the QR code ('L', 'M', 'Q', 'H') |
| margin | number | No | 4 | The margin around the QR code in modules |
| scale | number | No | 4 | The scale of the QR code |
| width | number | No | - | The width of the QR code in pixels (overrides scale) |
| color | object | No | - | The color of the QR code |
| color.dark | string | No | '#000000' | The color of the dark modules |
| color.light | string | No | '#ffffff' | The color of the light modules |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| qrcode | string | The generated QR code as a base64 string or binary data |
| error | string | Error message if the operation failed |

## Example Usage

```javascript
// Generate a QR code from a URL
const result = await mintflow.run({
  plugin: 'qrcode',
  action: 'text_to_qrcode',
  input: {
    text: 'https://example.com',
    outputFormat: 'base64',
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 8
  }
});

// The result.qrcode will contain a base64 data URL that can be used in an <img> tag
console.log(result.qrcode);
// Output: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

## Error Correction Levels

- **L (Low)**: 7% of codewords can be restored
- **M (Medium)**: 15% of codewords can be restored
- **Q (Quartile)**: 25% of codewords can be restored
- **H (High)**: 30% of codewords can be restored

Higher error correction levels make the QR code more resistant to damage but also increase its size.

## Dependencies

This plugin uses the [node-qrcode](https://github.com/soldair/node-qrcode) library.

## License

MIT
