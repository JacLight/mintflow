import { describe, expect, it } from '@jest/globals';
import mediaProcessorPlugin from '../src/index.js';

describe('mediaProcessorPlugin', () => {
  it('should have the correct properties', () => {
    expect(mediaProcessorPlugin).toHaveProperty('name', 'media-processor');
    expect(mediaProcessorPlugin).toHaveProperty('description');
    expect(mediaProcessorPlugin).toHaveProperty('id', 'media-processor');
    expect(mediaProcessorPlugin).toHaveProperty('runner', 'node');
    expect(mediaProcessorPlugin).toHaveProperty('inputSchema');
    expect(mediaProcessorPlugin).toHaveProperty('outputSchema');
    expect(mediaProcessorPlugin).toHaveProperty('actions');
    expect(mediaProcessorPlugin).toHaveProperty('method', 'exec');
  });

  it('should have the correct actions', () => {
    expect(Array.isArray(mediaProcessorPlugin.actions)).toBe(true);
    expect(mediaProcessorPlugin.actions.length).toBe(10);
    expect(mediaProcessorPlugin.actions[0]).toHaveProperty('name', 'text_to_qrcode');
    expect(mediaProcessorPlugin.actions[1]).toHaveProperty('name', 'text_to_barcode');
    expect(mediaProcessorPlugin.actions[2]).toHaveProperty('name', 'resize_image');
    expect(mediaProcessorPlugin.actions[3]).toHaveProperty('name', 'apply_filter');
    expect(mediaProcessorPlugin.actions[4]).toHaveProperty('name', 'convert_format');
    expect(mediaProcessorPlugin.actions[5]).toHaveProperty('name', 'extract_text');
    expect(mediaProcessorPlugin.actions[6]).toHaveProperty('name', 'analyze_image');
    expect(mediaProcessorPlugin.actions[7]).toHaveProperty('name', 'add_watermark');
    expect(mediaProcessorPlugin.actions[8]).toHaveProperty('name', 'compress_image');
    expect(mediaProcessorPlugin.actions[9]).toHaveProperty('name', 'extract_metadata');
  });

  describe('QR Code functionality', () => {
    it('should have the correct descriptions for QR code actions', () => {
      const textToQrcode = mediaProcessorPlugin.actions.find(action => action.name === 'text_to_qrcode');
      expect(textToQrcode).toBeDefined();
      if (textToQrcode) {
        expect(textToQrcode).toHaveProperty('description', 'Convert text to QR code');
      }
    });

    it('should have the correct input schemas for QR code actions', () => {
      const textToQrcode = mediaProcessorPlugin.actions.find(action => action.name === 'text_to_qrcode');
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

    it('should have the correct output schemas for QR code actions', () => {
      const textToQrcode = mediaProcessorPlugin.actions.find(action => action.name === 'text_to_qrcode');
      expect(textToQrcode).toBeDefined();
      if (textToQrcode) {
        expect(textToQrcode).toHaveProperty('outputSchema');
        expect(textToQrcode.outputSchema).toHaveProperty('type', 'object');
        expect(textToQrcode.outputSchema.properties).toHaveProperty('qrcode');
        expect(textToQrcode.outputSchema.properties).toHaveProperty('error');
      }
    });
  });

  describe('Barcode functionality', () => {
    it('should have the correct descriptions for barcode actions', () => {
      const textToBarcode = mediaProcessorPlugin.actions.find(action => action.name === 'text_to_barcode');
      expect(textToBarcode).toBeDefined();
      if (textToBarcode) {
        expect(textToBarcode).toHaveProperty('description', 'Convert text to barcode');
      }
    });

    it('should have the correct input schemas for barcode actions', () => {
      const textToBarcode = mediaProcessorPlugin.actions.find(action => action.name === 'text_to_barcode');
      expect(textToBarcode).toBeDefined();
      if (textToBarcode) {
        expect(textToBarcode).toHaveProperty('inputSchema');
        expect(textToBarcode.inputSchema).toHaveProperty('type', 'object');
        expect(textToBarcode.inputSchema).toHaveProperty('required');
        expect(textToBarcode.inputSchema.required).toContain('text');
        expect(textToBarcode.inputSchema.properties).toHaveProperty('text');
        expect(textToBarcode.inputSchema.properties).toHaveProperty('format');
        expect(textToBarcode.inputSchema.properties).toHaveProperty('outputFormat');
        expect(textToBarcode.inputSchema.properties).toHaveProperty('width');
        expect(textToBarcode.inputSchema.properties).toHaveProperty('height');
        expect(textToBarcode.inputSchema.properties).toHaveProperty('displayValue');
      }
    });

    it('should have the correct output schemas for barcode actions', () => {
      const textToBarcode = mediaProcessorPlugin.actions.find(action => action.name === 'text_to_barcode');
      expect(textToBarcode).toBeDefined();
      if (textToBarcode) {
        expect(textToBarcode).toHaveProperty('outputSchema');
        expect(textToBarcode.outputSchema).toHaveProperty('type', 'object');
        expect(textToBarcode.outputSchema.properties).toHaveProperty('barcode');
        expect(textToBarcode.outputSchema.properties).toHaveProperty('error');
      }
    });
  });

  describe('Image Processing functionality', () => {
    describe('Resize Image', () => {
      it('should have the correct descriptions for resize image action', () => {
        const resizeImage = mediaProcessorPlugin.actions.find(action => action.name === 'resize_image');
        expect(resizeImage).toBeDefined();
        if (resizeImage) {
          expect(resizeImage).toHaveProperty('description', 'Resize an image to specified dimensions');
        }
      });

      it('should have the correct input schema for resize image action', () => {
        const resizeImage = mediaProcessorPlugin.actions.find(action => action.name === 'resize_image');
        expect(resizeImage).toBeDefined();
        if (resizeImage) {
          expect(resizeImage).toHaveProperty('inputSchema');
          expect(resizeImage.inputSchema).toHaveProperty('type', 'object');
          expect(resizeImage.inputSchema).toHaveProperty('required');
          expect(resizeImage.inputSchema.required).toContain('image');
          expect(resizeImage.inputSchema.properties).toHaveProperty('image');
          expect(resizeImage.inputSchema.properties).toHaveProperty('width');
          expect(resizeImage.inputSchema.properties).toHaveProperty('height');
          expect(resizeImage.inputSchema.properties).toHaveProperty('fit');
          expect(resizeImage.inputSchema.properties).toHaveProperty('position');
        }
      });

      it('should have the correct output schema for resize image action', () => {
        const resizeImage = mediaProcessorPlugin.actions.find(action => action.name === 'resize_image');
        expect(resizeImage).toBeDefined();
        if (resizeImage) {
          expect(resizeImage).toHaveProperty('outputSchema');
          expect(resizeImage.outputSchema).toHaveProperty('type', 'object');
          expect(resizeImage.outputSchema.properties).toHaveProperty('image');
          expect(resizeImage.outputSchema.properties).toHaveProperty('error');
        }
      });
    });

    describe('Apply Filter', () => {
      it('should have the correct descriptions for apply filter action', () => {
        const applyFilter = mediaProcessorPlugin.actions.find(action => action.name === 'apply_filter');
        expect(applyFilter).toBeDefined();
        if (applyFilter) {
          expect(applyFilter).toHaveProperty('description', 'Apply a filter to an image');
        }
      });

      it('should have the correct input schema for apply filter action', () => {
        const applyFilter = mediaProcessorPlugin.actions.find(action => action.name === 'apply_filter');
        expect(applyFilter).toBeDefined();
        if (applyFilter) {
          expect(applyFilter).toHaveProperty('inputSchema');
          expect(applyFilter.inputSchema).toHaveProperty('type', 'object');
          expect(applyFilter.inputSchema).toHaveProperty('required');
          expect(applyFilter.inputSchema.required).toContain('image');
          expect(applyFilter.inputSchema.required).toContain('filter');
          expect(applyFilter.inputSchema.properties).toHaveProperty('image');
          expect(applyFilter.inputSchema.properties).toHaveProperty('filter');
          expect(applyFilter.inputSchema.properties).toHaveProperty('intensity');
        }
      });

      it('should have the correct output schema for apply filter action', () => {
        const applyFilter = mediaProcessorPlugin.actions.find(action => action.name === 'apply_filter');
        expect(applyFilter).toBeDefined();
        if (applyFilter) {
          expect(applyFilter).toHaveProperty('outputSchema');
          expect(applyFilter.outputSchema).toHaveProperty('type', 'object');
          expect(applyFilter.outputSchema.properties).toHaveProperty('image');
          expect(applyFilter.outputSchema.properties).toHaveProperty('error');
        }
      });
    });

    describe('Convert Format', () => {
      it('should have the correct descriptions for convert format action', () => {
        const convertFormat = mediaProcessorPlugin.actions.find(action => action.name === 'convert_format');
        expect(convertFormat).toBeDefined();
        if (convertFormat) {
          expect(convertFormat).toHaveProperty('description', 'Convert an image to a different format');
        }
      });

      it('should have the correct input schema for convert format action', () => {
        const convertFormat = mediaProcessorPlugin.actions.find(action => action.name === 'convert_format');
        expect(convertFormat).toBeDefined();
        if (convertFormat) {
          expect(convertFormat).toHaveProperty('inputSchema');
          expect(convertFormat.inputSchema).toHaveProperty('type', 'object');
          expect(convertFormat.inputSchema).toHaveProperty('required');
          expect(convertFormat.inputSchema.required).toContain('image');
          expect(convertFormat.inputSchema.required).toContain('format');
          expect(convertFormat.inputSchema.properties).toHaveProperty('image');
          expect(convertFormat.inputSchema.properties).toHaveProperty('format');
          expect(convertFormat.inputSchema.properties).toHaveProperty('quality');
          expect(convertFormat.inputSchema.properties).toHaveProperty('lossless');
        }
      });

      it('should have the correct output schema for convert format action', () => {
        const convertFormat = mediaProcessorPlugin.actions.find(action => action.name === 'convert_format');
        expect(convertFormat).toBeDefined();
        if (convertFormat) {
          expect(convertFormat).toHaveProperty('outputSchema');
          expect(convertFormat.outputSchema).toHaveProperty('type', 'object');
          expect(convertFormat.outputSchema.properties).toHaveProperty('image');
          expect(convertFormat.outputSchema.properties).toHaveProperty('error');
        }
      });
    });
  });

  describe('OCR functionality', () => {
    it('should have the correct descriptions for OCR actions', () => {
      const extractText = mediaProcessorPlugin.actions.find(action => action.name === 'extract_text');
      expect(extractText).toBeDefined();
      if (extractText) {
        expect(extractText).toHaveProperty('description', 'Extract text from an image using OCR');
      }
    });

    it('should have the correct input schema for OCR actions', () => {
      const extractText = mediaProcessorPlugin.actions.find(action => action.name === 'extract_text');
      expect(extractText).toBeDefined();
      if (extractText) {
        expect(extractText).toHaveProperty('inputSchema');
        expect(extractText.inputSchema).toHaveProperty('type', 'object');
        expect(extractText.inputSchema).toHaveProperty('required');
        expect(extractText.inputSchema.required).toContain('image');
        expect(extractText.inputSchema.properties).toHaveProperty('image');
        expect(extractText.inputSchema.properties).toHaveProperty('language');
        expect(extractText.inputSchema.properties).toHaveProperty('oem');
        expect(extractText.inputSchema.properties).toHaveProperty('psm');
        expect(extractText.inputSchema.properties).toHaveProperty('rectangles');
      }
    });

    it('should have the correct output schema for OCR actions', () => {
      const extractText = mediaProcessorPlugin.actions.find(action => action.name === 'extract_text');
      expect(extractText).toBeDefined();
      if (extractText) {
        expect(extractText).toHaveProperty('outputSchema');
        expect(extractText.outputSchema).toHaveProperty('type', 'object');
        expect(extractText.outputSchema.properties).toHaveProperty('text');
        expect(extractText.outputSchema.properties).toHaveProperty('confidence');
        expect(extractText.outputSchema.properties).toHaveProperty('words');
        expect(extractText.outputSchema.properties).toHaveProperty('error');
      }
    });
  });

  describe('AI Image Analysis functionality', () => {
    it('should have the correct descriptions for AI image analysis actions', () => {
      const analyzeImage = mediaProcessorPlugin.actions.find(action => action.name === 'analyze_image');
      expect(analyzeImage).toBeDefined();
      if (analyzeImage) {
        expect(analyzeImage).toHaveProperty('description', 'Analyze an image using AI to detect objects, faces, and more');
      }
    });

    it('should have the correct input schema for AI image analysis actions', () => {
      const analyzeImage = mediaProcessorPlugin.actions.find(action => action.name === 'analyze_image');
      expect(analyzeImage).toBeDefined();
      if (analyzeImage) {
        expect(analyzeImage).toHaveProperty('inputSchema');
        expect(analyzeImage.inputSchema).toHaveProperty('type', 'object');
        expect(analyzeImage.inputSchema).toHaveProperty('required');
        expect(analyzeImage.inputSchema.required).toContain('image');
        expect(analyzeImage.inputSchema.properties).toHaveProperty('image');
        expect(analyzeImage.inputSchema.properties).toHaveProperty('analysisTypes');
        expect(analyzeImage.inputSchema.properties).toHaveProperty('minConfidence');
        expect(analyzeImage.inputSchema.properties).toHaveProperty('maxResults');
        expect(analyzeImage.inputSchema.properties).toHaveProperty('includeFacialAttributes');
      }
    });

    it('should have the correct output schema for AI image analysis actions', () => {
      const analyzeImage = mediaProcessorPlugin.actions.find(action => action.name === 'analyze_image');
      expect(analyzeImage).toBeDefined();
      if (analyzeImage) {
        expect(analyzeImage).toHaveProperty('outputSchema');
        expect(analyzeImage.outputSchema).toHaveProperty('type', 'object');
        expect(analyzeImage.outputSchema.properties).toHaveProperty('objects');
        expect(analyzeImage.outputSchema.properties).toHaveProperty('faces');
        expect(analyzeImage.outputSchema.properties).toHaveProperty('labels');
        expect(analyzeImage.outputSchema.properties).toHaveProperty('moderation');
        expect(analyzeImage.outputSchema.properties).toHaveProperty('colors');
        expect(analyzeImage.outputSchema.properties).toHaveProperty('error');
      }
    });
  });

  describe('Watermarking functionality', () => {
    it('should have the correct descriptions for watermarking actions', () => {
      const addWatermark = mediaProcessorPlugin.actions.find(action => action.name === 'add_watermark');
      expect(addWatermark).toBeDefined();
      if (addWatermark) {
        expect(addWatermark).toHaveProperty('description', 'Add a text or image watermark to an image');
      }
    });

    it('should have the correct input schema for watermarking actions', () => {
      const addWatermark = mediaProcessorPlugin.actions.find(action => action.name === 'add_watermark');
      expect(addWatermark).toBeDefined();
      if (addWatermark) {
        expect(addWatermark).toHaveProperty('inputSchema');
        expect(addWatermark.inputSchema).toHaveProperty('type', 'object');
        expect(addWatermark.inputSchema).toHaveProperty('required');
        expect(addWatermark.inputSchema.required).toContain('image');
        expect(addWatermark.inputSchema.properties).toHaveProperty('image');
        expect(addWatermark.inputSchema.properties).toHaveProperty('watermarkType');
        expect(addWatermark.inputSchema.properties).toHaveProperty('text');
        expect(addWatermark.inputSchema.properties).toHaveProperty('watermarkImage');
        expect(addWatermark.inputSchema.properties).toHaveProperty('position');
        expect(addWatermark.inputSchema.properties).toHaveProperty('opacity');
        expect(addWatermark.inputSchema.properties).toHaveProperty('margin');
        expect(addWatermark.inputSchema.properties).toHaveProperty('rotation');
        expect(addWatermark.inputSchema.properties).toHaveProperty('scale');
        expect(addWatermark.inputSchema.properties).toHaveProperty('font');
      }
    });

    it('should have the correct output schema for watermarking actions', () => {
      const addWatermark = mediaProcessorPlugin.actions.find(action => action.name === 'add_watermark');
      expect(addWatermark).toBeDefined();
      if (addWatermark) {
        expect(addWatermark).toHaveProperty('outputSchema');
        expect(addWatermark.outputSchema).toHaveProperty('type', 'object');
        expect(addWatermark.outputSchema.properties).toHaveProperty('image');
        expect(addWatermark.outputSchema.properties).toHaveProperty('error');
      }
    });
  });

  describe('Image Compression functionality', () => {
    it('should have the correct descriptions for image compression actions', () => {
      const compressImage = mediaProcessorPlugin.actions.find(action => action.name === 'compress_image');
      expect(compressImage).toBeDefined();
      if (compressImage) {
        expect(compressImage).toHaveProperty('description', 'Compress an image to reduce file size while maintaining acceptable quality');
      }
    });

    it('should have the correct input schema for image compression actions', () => {
      const compressImage = mediaProcessorPlugin.actions.find(action => action.name === 'compress_image');
      expect(compressImage).toBeDefined();
      if (compressImage) {
        expect(compressImage).toHaveProperty('inputSchema');
        expect(compressImage.inputSchema).toHaveProperty('type', 'object');
        expect(compressImage.inputSchema).toHaveProperty('required');
        expect(compressImage.inputSchema.required).toContain('image');
        expect(compressImage.inputSchema.properties).toHaveProperty('image');
        expect(compressImage.inputSchema.properties).toHaveProperty('quality');
        expect(compressImage.inputSchema.properties).toHaveProperty('format');
        expect(compressImage.inputSchema.properties).toHaveProperty('maxWidth');
        expect(compressImage.inputSchema.properties).toHaveProperty('maxHeight');
        expect(compressImage.inputSchema.properties).toHaveProperty('progressive');
        expect(compressImage.inputSchema.properties).toHaveProperty('compressionLevel');
        expect(compressImage.inputSchema.properties).toHaveProperty('effort');
        expect(compressImage.inputSchema.properties).toHaveProperty('metadata');
        expect(compressImage.inputSchema.properties).toHaveProperty('optimizeScans');
      }
    });

    it('should have the correct output schema for image compression actions', () => {
      const compressImage = mediaProcessorPlugin.actions.find(action => action.name === 'compress_image');
      expect(compressImage).toBeDefined();
      if (compressImage) {
        expect(compressImage).toHaveProperty('outputSchema');
        expect(compressImage.outputSchema).toHaveProperty('type', 'object');
        expect(compressImage.outputSchema.properties).toHaveProperty('image');
        expect(compressImage.outputSchema.properties).toHaveProperty('originalSize');
        expect(compressImage.outputSchema.properties).toHaveProperty('compressedSize');
        expect(compressImage.outputSchema.properties).toHaveProperty('compressionRatio');
        expect(compressImage.outputSchema.properties).toHaveProperty('error');
      }
    });
  });

  describe('Metadata Extraction functionality', () => {
    it('should have the correct descriptions for metadata extraction actions', () => {
      const extractMetadata = mediaProcessorPlugin.actions.find(action => action.name === 'extract_metadata');
      expect(extractMetadata).toBeDefined();
      if (extractMetadata) {
        expect(extractMetadata).toHaveProperty('description', 'Extract metadata from an image including EXIF, IPTC, and XMP data');
      }
    });

    it('should have the correct input schema for metadata extraction actions', () => {
      const extractMetadata = mediaProcessorPlugin.actions.find(action => action.name === 'extract_metadata');
      expect(extractMetadata).toBeDefined();
      if (extractMetadata) {
        expect(extractMetadata).toHaveProperty('inputSchema');
        expect(extractMetadata.inputSchema).toHaveProperty('type', 'object');
        expect(extractMetadata.inputSchema).toHaveProperty('required');
        expect(extractMetadata.inputSchema.required).toContain('image');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('image');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('includeExif');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('includeIptc');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('includeXmp');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('includeIcc');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('sanitize');
        expect(extractMetadata.inputSchema.properties).toHaveProperty('flatten');
      }
    });

    it('should have the correct output schema for metadata extraction actions', () => {
      const extractMetadata = mediaProcessorPlugin.actions.find(action => action.name === 'extract_metadata');
      expect(extractMetadata).toBeDefined();
      if (extractMetadata) {
        expect(extractMetadata).toHaveProperty('outputSchema');
        expect(extractMetadata.outputSchema).toHaveProperty('type', 'object');
        expect(extractMetadata.outputSchema.properties).toHaveProperty('metadata');
        expect(extractMetadata.outputSchema.properties).toHaveProperty('format');
        expect(extractMetadata.outputSchema.properties).toHaveProperty('size');
        expect(extractMetadata.outputSchema.properties).toHaveProperty('error');
      }
    });
  });
});
