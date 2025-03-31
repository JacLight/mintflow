import { describe, it, expect } from '@jest/globals';
import pdfPlugin from '../src/index';

describe('pdfPlugin', () => {
    it('should have the correct properties', () => {
        expect(pdfPlugin.name).toBe('PDF');
        expect(pdfPlugin.id).toBe('pdf');
        expect(pdfPlugin.actions).toHaveLength(3);
    });

    it('should have the correct actions', () => {
        const actionNames = pdfPlugin.actions.map(action => action.name);
        expect(actionNames).toContain('extract_text');
        expect(actionNames).toContain('text_to_pdf');
        expect(actionNames).toContain('image_to_pdf');
    });

    it('should have the correct descriptions for actions', () => {
        const extractTextAction = pdfPlugin.actions.find(action => action.name === 'extract_text');
        const textToPdfAction = pdfPlugin.actions.find(action => action.name === 'text_to_pdf');
        const imageToPdfAction = pdfPlugin.actions.find(action => action.name === 'image_to_pdf');

        expect(extractTextAction?.description).toContain('Extract text');
        expect(textToPdfAction?.description).toContain('Convert text to a PDF');
        expect(imageToPdfAction?.description).toContain('Convert');
        expect(imageToPdfAction?.description).toContain('PDF');
    });
});
