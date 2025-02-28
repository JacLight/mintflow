import { describe, expect, it } from '@jest/globals';
import qrcodePlugin from '../src/index.js';

describe('qrcodePlugin', () => {
  it('should have the correct properties', () => {
    expect(qrcodePlugin).toHaveProperty('name', 'qrcode');
    expect(qrcodePlugin).toHaveProperty('description');
    expect(qrcodePlugin).toHaveProperty('id', 'qrcode');
    expect(qrcodePlugin).toHaveProperty('runner', 'node');
    expect(qrcodePlugin).toHaveProperty('inputSchema');
    expect(qrcodePlugin).toHaveProperty('outputSchema');
    expect(qrcodePlugin).toHaveProperty('actions');
    expect(qrcodePlugin).toHaveProperty('method', 'exec');
  });

  it('should have the correct actions', () => {
    expect(Array.isArray(qrcodePlugin.actions)).toBe(true);
    expect(qrcodePlugin.actions.length).toBe(1);
    expect(qrcodePlugin.actions[0]).toHaveProperty('name', 'text_to_qrcode');
  });

  it('should have the correct descriptions for actions', () => {
    const textToQrcode = qrcodePlugin.actions.find(action => action.name === 'text_to_qrcode');
    expect(textToQrcode).toBeDefined();
    if (textToQrcode) {
      expect(textToQrcode).toHaveProperty('description', 'Convert text to QR code');
    }
  });

  it('should have the correct input schemas for actions', () => {
    const textToQrcode = qrcodePlugin.actions.find(action => action.name === 'text_to_qrcode');
    expect(textToQrcode).toBeDefined();
    if (textToQrcode) {
      expect(textToQrcode).toHaveProperty('inputSchema');
      expect(textToQrcode.inputSchema).toHaveProperty('type', 'object');
      expect(textToQrcode.inputSchema).toHaveProperty('required');
      expect(textToQrcode.inputSchema.required).toContain('text');
      expect(textToQrcode.inputSchema.properties).toHaveProperty('text');
      expect(textToQrcode.inputSchema.properties).toHaveProperty('outputFormat');
      expect(textToQrcode.inputSchema.properties).toHaveProperty('errorCorrectionLevel');
    }
  });

  it('should have the correct output schemas for actions', () => {
    const textToQrcode = qrcodePlugin.actions.find(action => action.name === 'text_to_qrcode');
    expect(textToQrcode).toBeDefined();
    if (textToQrcode) {
      expect(textToQrcode).toHaveProperty('outputSchema');
      expect(textToQrcode.outputSchema).toHaveProperty('type', 'object');
      expect(textToQrcode.outputSchema.properties).toHaveProperty('qrcode');
      expect(textToQrcode.outputSchema.properties).toHaveProperty('error');
    }
  });
});
