import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShareUpdate } from '../src/actions/create-share-update.js';
import * as common from '../src/common.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('axios');
vi.mock('jsonwebtoken');
vi.mock('../src/common.js', () => ({
  BASE_URL: 'https://api.linkedin.com',
  LINKEDIN_HEADERS: {
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': '202411',
  },
  sanitizeText: vi.fn((text) => `sanitized-${text}`),
  generatePostRequestBody: vi.fn(),
  uploadImage: vi.fn()
}));

describe('createShareUpdate', () => {
  const mockInput = {
    accessToken: 'test-access-token',
    idToken: 'test-id-token',
    text: 'Test post',
    visibility: 'PUBLIC',
    link: 'https://example.com',
    linkTitle: 'Example',
    linkDescription: 'Example description'
  };

  const mockDecodedToken = {
    sub: 'user123'
  };

  const mockRequestBody = {
    author: 'urn:li:person:user123',
    commentary: 'sanitized-Test post',
    lifecycleState: 'PUBLISHED',
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
    },
    content: {
      article: {
        source: 'https://example.com',
        title: 'Example',
        description: 'Example description'
      }
    },
    isReshareDisabledByAuthor: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jwt.decode).mockReturnValue(mockDecodedToken);
    vi.mocked(common.generatePostRequestBody).mockReturnValue(mockRequestBody);
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });
  });

  it('should create a share update successfully', async () => {
    const result = await createShareUpdate(mockInput);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Share update created successfully');
    
    expect(jwt.decode).toHaveBeenCalledWith('test-id-token');
    expect(common.sanitizeText).toHaveBeenCalledWith('Test post');
    expect(common.generatePostRequestBody).toHaveBeenCalledWith({
      urn: 'person:user123',
      text: 'sanitized-Test post',
      link: 'https://example.com',
      linkTitle: 'Example',
      linkDescription: 'Example description',
      visibility: 'PUBLIC',
      image: undefined
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.linkedin.com/rest/posts',
      mockRequestBody,
      {
        headers: {
          ...common.LINKEDIN_HEADERS,
          'Authorization': 'Bearer test-access-token'
        }
      }
    );
  });

  it('should handle image uploads', async () => {
    const mockImage = { 
      value: { 
        uploadUrlExpiresAt: 1234567890,
        uploadUrl: 'https://upload.linkedin.com/image123',
        image: 'image123' 
      } 
    };
    vi.mocked(common.uploadImage).mockResolvedValue(mockImage);
    
    const inputWithImage = {
      ...mockInput,
      imageData: 'base64-image-data',
      imageFilename: 'image.jpg'
    };
    
    await createShareUpdate(inputWithImage);
    
    expect(common.uploadImage).toHaveBeenCalledWith(
      'test-access-token',
      'person:user123',
      'base64-image-data',
      'image.jpg'
    );
    
    expect(common.generatePostRequestBody).toHaveBeenCalledWith(
      expect.objectContaining({
        image: mockImage
      })
    );
  });

  it('should handle invalid ID token', async () => {
    vi.mocked(jwt.decode).mockReturnValue(null);
    
    const result = await createShareUpdate(mockInput);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to create share update');
    expect(result.message).toContain('Invalid ID token');
  });

  it('should handle API errors', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('API error'));
    
    const result = await createShareUpdate(mockInput);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to create share update');
    expect(result.message).toContain('API error');
  });
});
