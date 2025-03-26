import axios from 'axios';
import {
    InstagramBusinessAccount,
    InstagramPhotoPostParams,
    InstagramReelPostParams
} from './models.js';

const BASE_URL = 'https://graph.facebook.com/v17.0';

/**
 * Get a list of Instagram business accounts the user manages
 */
export const getInstagramAccounts = async (accessToken: string): Promise<InstagramBusinessAccount[]> => {
    try {
        // First get the Facebook pages
        const pagesResponse = await axios.get(`${BASE_URL}/me/accounts`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,access_token,instagram_business_account'
            }
        });

        // Filter pages that have Instagram business accounts
        const instagramAccounts = pagesResponse.data.data
            .filter((page: any) => page.instagram_business_account)
            .map((page: any) => ({
                id: page.instagram_business_account.id,
                name: page.name,
                access_token: page.access_token
            }));

        return instagramAccounts;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Upload a photo to Instagram
 */
export const uploadPhoto = async (params: InstagramPhotoPostParams) => {
    try {
        const { token, accountId, caption, photoUrl } = params;

        // Step 1: Create a container for the photo
        const createContainerResponse = await axios.post(
            `${BASE_URL}/${accountId}/media`,
            {
                access_token: token,
                image_url: photoUrl,
                caption: caption || ''
            }
        );

        const containerId = createContainerResponse.data.id;

        // Step 2: Publish the container
        const publishResponse = await axios.post(
            `${BASE_URL}/${accountId}/media_publish`,
            {
                access_token: token,
                creation_id: containerId
            }
        );

        return publishResponse.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Upload a reel (video) to Instagram
 */
export const uploadReel = async (params: InstagramReelPostParams) => {
    try {
        const { token, accountId, caption, videoUrl } = params;

        // Step 1: Create a container for the video
        const createContainerResponse = await axios.post(
            `${BASE_URL}/${accountId}/media`,
            {
                access_token: token,
                video_url: videoUrl,
                caption: caption || '',
                media_type: 'REELS'
            }
        );

        const containerId = createContainerResponse.data.id;

        // Step 2: Wait for video processing to complete
        let isUploaded = await isUploadSuccessful(containerId, token, 0);

        if (!isUploaded) {
            throw new Error('Video upload processing failed or timed out');
        }

        // Step 3: Publish the container
        const publishResponse = await axios.post(
            `${BASE_URL}/${accountId}/media_publish`,
            {
                access_token: token,
                creation_id: containerId
            }
        );

        return publishResponse.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Check if a video upload has been processed successfully
 */
async function isUploadSuccessful(
    containerId: string,
    accessToken: string,
    retryCount: number
): Promise<boolean> {
    // Limit retries to avoid infinite loops
    if (retryCount > 20) return false;

    try {
        const response = await axios.get(`${BASE_URL}/${containerId}`, {
            params: {
                access_token: accessToken,
                fields: 'status_code'
            }
        });

        if (response.data.status_code !== 'FINISHED') {
            // Wait 5 seconds before checking again
            await wait(5000);
            return await isUploadSuccessful(containerId, accessToken, retryCount + 1);
        } else {
            return true;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Instagram API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
}

/**
 * Helper function to wait for a specified number of milliseconds
 */
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
