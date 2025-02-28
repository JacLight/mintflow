import axios from 'axios';
import {
    FacebookPostParams,
    FacebookPhotoPostParams,
    FacebookVideoPostParams,
    FacebookPage
} from './models';

const BASE_URL = 'https://graph.facebook.com/v17.0';

/**
 * Get a list of pages the user manages
 */
export const getPages = async (accessToken: string): Promise<FacebookPage[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/me/accounts`, {
            params: {
                access_token: accessToken
            }
        });

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a post on a Facebook page
 */
export const createPost = async (params: FacebookPostParams) => {
    try {
        const { token, pageId, message, link } = params;

        const requestBody: any = {
            access_token: token,
            message: message
        };

        if (link) {
            requestBody.link = link;
        }

        const response = await axios.post(
            `${BASE_URL}/${pageId}/feed`,
            requestBody
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a photo post on a Facebook page
 */
export const createPhotoPost = async (params: FacebookPhotoPostParams) => {
    try {
        const { token, pageId, caption, photoUrl } = params;

        const requestBody: any = {
            access_token: token,
            url: photoUrl
        };

        if (caption) {
            requestBody.caption = caption;
        }

        const response = await axios.post(
            `${BASE_URL}/${pageId}/photos`,
            requestBody
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a video post on a Facebook page
 */
export const createVideoPost = async (params: FacebookVideoPostParams) => {
    try {
        const { token, pageId, title, description, videoUrl } = params;

        const requestBody: any = {
            access_token: token,
            file_url: videoUrl
        };

        if (title) {
            requestBody.title = title;
        }

        if (description) {
            requestBody.description = description;
        }

        const response = await axios.post(
            `${BASE_URL}/${pageId}/videos`,
            requestBody
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Facebook API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};
