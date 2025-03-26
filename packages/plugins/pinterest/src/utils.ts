import axios from 'axios';
import {
    PinterestPin,
    PinterestBoard,
    PinterestUser,
    PinterestCreatePinParams,
    PinterestCreateBoardParams,
    PinterestGetPinsParams,
    PinterestGetBoardsParams,
    PinterestSearchParams
} from './models.js';

const BASE_URL = 'https://api.pinterest.com/v5';

/**
 * Create a pin on Pinterest
 */
export const createPin = async (params: PinterestCreatePinParams): Promise<PinterestPin> => {
    try {
        const { token, boardId, title, description, imageUrl, link, altText } = params;

        const requestBody: any = {
            board_id: boardId,
            title,
            media_source: {
                source_type: 'image_url',
                url: imageUrl
            }
        };

        if (description) {
            requestBody.description = description;
        }

        if (link) {
            requestBody.link = link;
        }

        if (altText) {
            requestBody.alt_text = altText;
        }

        const response = await axios.post(
            `${BASE_URL}/pins`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Pinterest API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a board on Pinterest
 */
export const createBoard = async (params: PinterestCreateBoardParams): Promise<PinterestBoard> => {
    try {
        const { token, name, description, privacy = 'PUBLIC' } = params;

        const requestBody: any = {
            name,
            privacy
        };

        if (description) {
            requestBody.description = description;
        }

        const response = await axios.post(
            `${BASE_URL}/boards`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Pinterest API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get pins from a board
 */
export const getBoardPins = async (params: PinterestGetPinsParams): Promise<PinterestPin[]> => {
    try {
        const { token, boardId, maxResults = 25 } = params;

        const response = await axios.get(
            `${BASE_URL}/boards/${boardId}/pins`,
            {
                params: {
                    page_size: maxResults
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.items;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Pinterest API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get user's boards
 */
export const getUserBoards = async (params: PinterestGetBoardsParams): Promise<PinterestBoard[]> => {
    try {
        const { token, maxResults = 25 } = params;

        const response = await axios.get(
            `${BASE_URL}/boards`,
            {
                params: {
                    page_size: maxResults
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.items;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Pinterest API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get user profile information
 */
export const getUserProfile = async (token: string): Promise<PinterestUser> => {
    try {
        const response = await axios.get(
            `${BASE_URL}/user_account`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Pinterest API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Search Pinterest
 */
export const searchPins = async (params: PinterestSearchParams): Promise<PinterestPin[]> => {
    try {
        const { token, query, maxResults = 25 } = params;

        const response = await axios.get(
            `${BASE_URL}/pins/search`,
            {
                params: {
                    query,
                    page_size: maxResults
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.items;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Pinterest API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};
