import axios from 'axios';
import FormData from 'form-data';

export interface Image {
  value: {
    uploadUrlExpiresAt: number;
    uploadUrl: string;
    image: string;
  };
}

export interface Post {
  author: string;
  commentary: string;
  lifecycleState: string;
  visibility: string;
  distribution: {
    feedDistribution: string;
  };
  content?: {
    article?: {
      source: string;
      thumbnail?: string | undefined;
      title?: string | undefined;
      description?: string | undefined;
    };
    media?: {
      id: string;
    };
  };
  isReshareDisabledByAuthor: boolean;
}

/**
 * Sanitizes text for LinkedIn Posts API
 * LinkedIn Posts API has a list of characters that need to be escaped since it's type is "LittleText"
 * @see https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
 * @see https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format
 * 
 * @param text The text to sanitize
 * @returns The sanitized text
 */
export function sanitizeText(text: string): string {
  // eslint-disable-next-line no-useless-escape
  return text.replace(/[\(*\)\[\]\{\}<>@|~_]/gm, (x: string) => '\\' + x);
}

export const BASE_URL = 'https://api.linkedin.com';

export const LINKEDIN_HEADERS = {
  'X-Restli-Protocol-Version': '2.0.0',
  'LinkedIn-Version': '202411',
};

/**
 * Validates a LinkedIn OAuth token
 * 
 * @param accessToken The LinkedIn OAuth token to validate
 * @returns A boolean indicating whether the token is valid
 */
export async function validateOAuthToken(accessToken: string): Promise<boolean> {
  try {
    const response = await axios.get(`${BASE_URL}/v2/me`, {
      headers: {
        ...LINKEDIN_HEADERS,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Gets a list of companies the user has access to
 * 
 * @param accessToken The LinkedIn OAuth token
 * @returns A list of companies
 */
export async function getCompanies(accessToken: string): Promise<any> {
  const companies = (
    await axios.get(`${BASE_URL}/v2/organizationalEntityAcls`, {
      headers: {
        ...LINKEDIN_HEADERS,
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        q: 'roleAssignee',
      },
    })
  ).data;

  const companyIds = companies.elements.map(
    (company: { organizationalTarget: string }) => {
      return company.organizationalTarget.substr(
        company.organizationalTarget.lastIndexOf(':') + 1
      );
    }
  );

  const response = await axios.get(
    `${BASE_URL}/rest/organizations?ids=List(${companyIds.join(',')})`, 
    {
      headers: {
        ...LINKEDIN_HEADERS,
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  return response.data.results;
}

/**
 * Generates a post request body for LinkedIn
 * 
 * @param data The post data
 * @returns The post request body
 */
export function generatePostRequestBody(data: {
  urn: string;
  text: string;
  link?: string;
  linkTitle?: string;
  linkDescription?: string;
  visibility: string;
  image?: Image;
}): Post {
  const requestObject: Post = {
    author: `urn:li:${data.urn}`,
    lifecycleState: 'PUBLISHED',
    commentary: data.text,
    distribution: {
      feedDistribution: 'MAIN_FEED',
    },
    visibility: data.visibility,
    isReshareDisabledByAuthor: false,
  };

  if (data.link) {
    requestObject.content = {
      article: {
        source: data.link,
        title: data.linkTitle,
        description: data.linkDescription,
        thumbnail: data.image?.value.image,
      },
    };
  } else if (data.image) {
    requestObject.content = {
      media: {
        id: data.image.value.image,
      },
    };
  }

  return requestObject;
}

/**
 * Uploads an image to LinkedIn
 * 
 * @param accessToken The LinkedIn OAuth token
 * @param urn The URN of the entity to upload the image for
 * @param imageData The image data as a base64 string
 * @param filename The filename of the image
 * @returns The uploaded image information
 */
export async function uploadImage(
  accessToken: string,
  urn: string,
  imageData: string,
  filename: string
): Promise<Image> {
  // Initialize the upload
  const uploadResponse = await axios.post(
    `${BASE_URL}/v2/images`,
    {
      initializeUploadRequest: {
        owner: `urn:li:${urn}`,
      },
    },
    {
      headers: {
        ...LINKEDIN_HEADERS,
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        action: 'initializeUpload',
      },
    }
  );

  const uploadData = uploadResponse.data as Image;

  // Upload the image
  const uploadFormData = new FormData();
  uploadFormData.append('file', Buffer.from(imageData, 'base64'), filename);

  await axios.post(uploadData.value.uploadUrl, uploadFormData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return uploadData;
}
