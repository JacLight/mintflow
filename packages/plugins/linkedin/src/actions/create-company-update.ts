import axios from 'axios';
import { 
  BASE_URL, 
  LINKEDIN_HEADERS, 
  Image, 
  sanitizeText, 
  generatePostRequestBody, 
  uploadImage 
} from '../common.js';

export interface CreateCompanyUpdateInput {
  accessToken: string;
  companyId: string;
  text: string;
  imageData?: string;
  imageFilename?: string;
  link?: string;
  linkTitle?: string;
  linkDescription?: string;
}

export interface CreateCompanyUpdateOutput {
  success: boolean;
  message: string;
}

/**
 * Creates a company update on LinkedIn
 * 
 * @param input The input parameters
 * @returns The result of the operation
 */
export async function createCompanyUpdate(input: CreateCompanyUpdateInput): Promise<CreateCompanyUpdateOutput> {
  try {
    const { 
      accessToken, 
      companyId, 
      text, 
      imageData, 
      imageFilename, 
      link, 
      linkTitle, 
      linkDescription 
    } = input;
    
    // Upload image if provided
    let image: Image | undefined;
    if (imageData && imageFilename) {
      image = await uploadImage(
        accessToken,
        `organization:${companyId}`,
        imageData,
        imageFilename
      );
    }
    
    // Generate the post request body
    const requestBody = generatePostRequestBody({
      urn: `organization:${companyId}`,
      text: sanitizeText(text),
      link,
      linkTitle,
      linkDescription,
      visibility: 'PUBLIC', // Company updates are always public
      image,
    });
    
    // Create the post
    await axios.post(
      `${BASE_URL}/rest/posts`,
      requestBody,
      {
        headers: {
          ...LINKEDIN_HEADERS,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return {
      success: true,
      message: 'Company update created successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create company update: ${error.message}`
    };
  }
}
