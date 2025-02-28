import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCompanyUpdate } from '../src/actions/create-company-update.js';
import * as common from '../src/common.js';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
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

describe('createCompanyUpdate', () => {
  const mockInput = {
    accessToken: 'test-access-token',
    companyId: 'company123',
    text: 'Test company post',
    link: 'https://example.com',
    linkTitle: 'Example',
    linkDescription: 'Example description'
  };

  const mockRequestBody = {
    author: 'urn:li:organization:company123',
    commentary: 'sanitized-Test company post',
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
    vi.mocked(common.generatePostRequestBody).mockReturnValue(mockRequestBody);
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });
  });

  it('should create a company update successfully', async () => {
    const result = await createCompanyUpdate(mockInput);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Company update created successfully');
    
    expect(common.sanitizeText).toHaveBeenCalledWith('Test company post');
    expect(common.generatePostRequestBody).toHaveBeenCalledWith({
      urn: 'organization:company123',
      text: 'sanitized-Test company post',
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
    
    await createCompanyUpdate(inputWithImage);
    
    expect(common.uploadImage).toHaveBeenCalledWith(
      'test-access-token',
      'organization:company123',
      'base64-image-data',
      'image.jpg'
    );
    
    expect(common.generatePostRequestBody).toHaveBeenCalledWith(
      expect.objectContaining({
        image: mockImage
      })
    );
  });

  it('should handle API errors', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('API error'));
    
    const result = await createCompanyUpdate(mockInput);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to create company update');
    expect(result.message).toContain('API error');
  });
});
