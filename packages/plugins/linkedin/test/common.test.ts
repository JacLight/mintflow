import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  sanitizeText, 
  validateOAuthToken, 
  generatePostRequestBody,
  uploadImage
} from '../src/common.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('LinkedIn Common Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sanitizeText', () => {
    it('should escape special characters', () => {
      const input = 'Hello (world) [test] {example} <tag> @mention |pipe| ~tilde~ _underscore_';
      const expected = 'Hello \\(world\\) \\[test\\] \\{example\\} \\<tag\\> \\@mention \\|pipe\\| \\~tilde\\~ \\_underscore\\_';
      
      expect(sanitizeText(input)).toBe(expected);
    });
    
    it('should not modify regular text', () => {
      const input = 'Hello world! This is a test.';
      
      expect(sanitizeText(input)).toBe(input);
    });
  });

  describe('validateOAuthToken', () => {
    it('should return true for valid token', async () => {
      vi.mocked(axios.get).mockResolvedValue({ status: 200 });
      
      const result = await validateOAuthToken('valid-token');
      
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.linkedin.com/v2/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token'
          })
        })
      );
    });
    
    it('should return false for invalid token', async () => {
      vi.mocked(axios.get).mockResolvedValue({ status: 401 });
      
      const result = await validateOAuthToken('invalid-token');
      
      expect(result).toBe(false);
    });
    
    it('should return false when request fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));
      
      const result = await validateOAuthToken('error-token');
      
      expect(result).toBe(false);
    });
  });

  describe('generatePostRequestBody', () => {
    it('should generate a post request body with text only', () => {
      const data = {
        urn: 'person:123',
        text: 'Hello world',
        visibility: 'PUBLIC'
      };
      
      const result = generatePostRequestBody(data);
      
      expect(result).toEqual({
        author: 'urn:li:person:123',
        commentary: 'Hello world',
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
        },
        isReshareDisabledByAuthor: false
      });
    });
    
    it('should include link content when provided', () => {
      const data = {
        urn: 'person:123',
        text: 'Hello world',
        visibility: 'PUBLIC',
        link: 'https://example.com',
        linkTitle: 'Example',
        linkDescription: 'Example description'
      };
      
      const result = generatePostRequestBody(data);
      
      expect(result).toEqual({
        author: 'urn:li:person:123',
        commentary: 'Hello world',
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
        },
        content: {
          article: {
            source: 'https://example.com',
            title: 'Example',
            description: 'Example description',
            thumbnail: undefined
          }
        },
        isReshareDisabledByAuthor: false
      });
    });
    
    it('should include image content when provided without link', () => {
      const image = { 
        value: { 
          uploadUrlExpiresAt: 1234567890,
          uploadUrl: 'https://upload.linkedin.com/image123',
          image: 'image123' 
        } 
      };
      
      const data = {
        urn: 'person:123',
        text: 'Hello world',
        visibility: 'PUBLIC',
        image
      };
      
      const result = generatePostRequestBody(data);
      
      expect(result).toEqual({
        author: 'urn:li:person:123',
        commentary: 'Hello world',
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
        },
        content: {
          media: {
            id: 'image123'
          }
        },
        isReshareDisabledByAuthor: false
      });
    });
    
    it('should include image thumbnail with link when both are provided', () => {
      const image = { 
        value: { 
          uploadUrlExpiresAt: 1234567890,
          uploadUrl: 'https://upload.linkedin.com/image123',
          image: 'image123' 
        } 
      };
      
      const data = {
        urn: 'person:123',
        text: 'Hello world',
        visibility: 'PUBLIC',
        link: 'https://example.com',
        linkTitle: 'Example',
        linkDescription: 'Example description',
        image
      };
      
      const result = generatePostRequestBody(data);
      
      expect(result).toEqual({
        author: 'urn:li:person:123',
        commentary: 'Hello world',
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
        },
        content: {
          article: {
            source: 'https://example.com',
            title: 'Example',
            description: 'Example description',
            thumbnail: 'image123'
          }
        },
        isReshareDisabledByAuthor: false
      });
    });
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockInitResponse = {
        data: {
          value: {
            uploadUrlExpiresAt: 1234567890,
            uploadUrl: 'https://upload.linkedin.com/image123',
            image: 'image123'
          }
        }
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce(mockInitResponse);
      vi.mocked(axios.post).mockResolvedValueOnce({ status: 200 });
      
      const result = await uploadImage(
        'test-token',
        'person:123',
        'base64-image-data',
        'image.jpg'
      );
      
      expect(result).toEqual(mockInitResponse.data);
      
      // Check first call to initialize upload
      expect(axios.post).toHaveBeenNthCalledWith(
        1,
        'https://api.linkedin.com/v2/images',
        {
          initializeUploadRequest: {
            owner: 'urn:li:person:123'
          }
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          }),
          params: {
            action: 'initializeUpload'
          }
        })
      );
      
      // Check second call to upload the image
      const secondCallArgs = vi.mocked(axios.post).mock.calls[1];
      expect(secondCallArgs[0]).toBe('https://upload.linkedin.com/image123');
      // Just check that the second argument exists and is an object (FormData)
      expect(secondCallArgs[1]).toBeTruthy();
      expect(typeof secondCallArgs[1]).toBe('object');
      expect(secondCallArgs[2]).toEqual(expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'Content-Type': 'multipart/form-data'
        })
      }));
    });
  });
});
