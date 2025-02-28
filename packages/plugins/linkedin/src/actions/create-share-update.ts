import axios from 'axios';
import jwt from 'jsonwebtoken';
import { 
  BASE_URL, 
  LINKEDIN_HEADERS, 
  Image, 
  sanitizeText, 
  generatePostRequestBody, 
  uploadImage 
} from '../common.js';

export interface CreateShareUpdateInput {
  accessToken: string;
  idToken: string;
  text: string;
  visibility: string;
  imageData?: string;
  imageFilename?: string;
  link?: string;
  linkTitle?: string;
  linkDescription?: string;
}

export interface CreateShareUpdateOutput {
  success: boolean;
  message: string;
}

/**
 * Creates a share update on LinkedIn
 * 
 * @param input The input parameters
 * @returns The result of the operation
 */
export async function createShareUpdate(input: CreateShareUpdateInput): Promise<CreateShareUpdateOutput> {
  try {
    const { 
      accessToken, 
      idToken, 
      text, 
      visibility, 
      imageData, 
      imageFilename, 
      link, 
      linkTitle, 
      linkDescription 
    } = input;
    
    // Decode the ID token to get the user ID
    const decoded = jwt.decode(idToken) as jwt.JwtPayload;
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid ID token');
    }
    
    // Upload image if provided
    let image: Image | undefined;
    if (imageData && imageFilename) {
      image = await uploadImage(
        accessToken,
        `person:${decoded.sub}`,
        imageData,
        imageFilename
      );
    }
    
    // Generate the post request body
    const requestBody = generatePostRequestBody({
      urn: `person:${decoded.sub}`,
      text: sanitizeText(text),
      link,
      linkTitle,
      linkDescription,
      visibility,
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
      message: 'Share update created successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create share update: ${error.message}`
    };
  }
}
