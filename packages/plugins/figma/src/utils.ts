import axios from 'axios';
import { nanoid } from 'nanoid';
import {
    FIGMA_API,
    FigmaGetFileParams,
    FigmaGetFileCommentsParams,
    FigmaPostFileCommentParams,
    FigmaGetFileImagesParams,
    FigmaGetFileNodesParams,
    FigmaGetTeamProjectsParams,
    FigmaGetProjectFilesParams,
    FigmaGetTeamComponentsParams,
    FigmaGetFileComponentsParams,
    FigmaGetComponentSetsParams,
    FigmaGetStylesParams,
    FigmaCreateWebhookParams,
    FigmaDeleteWebhookParams,
    FigmaFile,
    FigmaCommentsResponse,
    FigmaImageResponse,
    FigmaNodesResponse,
    FigmaProjectsResponse,
    FigmaProjectFilesResponse,
    FigmaComponentsResponse,
    FigmaComponentSetsResponse,
    FigmaStylesResponse,
    FigmaWebhookResponse
} from './models';

/**
 * Get a Figma file
 */
export const getFile = async (params: FigmaGetFileParams): Promise<FigmaFile> => {
    try {
        const { token, fileKey } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.files.replace(':file_key', fileKey)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get comments from a Figma file
 */
export const getFileComments = async (params: FigmaGetFileCommentsParams): Promise<FigmaCommentsResponse> => {
    try {
        const { token, fileKey } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.comments.replace(':file_key', fileKey)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Post a comment to a Figma file
 */
export const postFileComment = async (params: FigmaPostFileCommentParams): Promise<{ id: string }> => {
    try {
        const { token, fileKey, message } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.comments.replace(':file_key', fileKey)}`;

        const response = await axios.post(url, { message }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get images from a Figma file
 */
export const getFileImages = async (params: FigmaGetFileImagesParams): Promise<FigmaImageResponse> => {
    try {
        const { token, fileKey, ids, scale, format } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.fileImages.replace(':file_key', fileKey)}`;

        const queryParams: Record<string, string | number> = {
            ids: ids.join(',')
        };

        if (scale) {
            queryParams.scale = scale;
        }

        if (format) {
            queryParams.format = format;
        }

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: queryParams
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get nodes from a Figma file
 */
export const getFileNodes = async (params: FigmaGetFileNodesParams): Promise<FigmaNodesResponse> => {
    try {
        const { token, fileKey, ids } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.fileNodes.replace(':file_key', fileKey)}`;

        const queryParams = {
            ids: ids.join(',')
        };

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: queryParams
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get projects from a Figma team
 */
export const getTeamProjects = async (params: FigmaGetTeamProjectsParams): Promise<FigmaProjectsResponse> => {
    try {
        const { token, teamId } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.projects.replace(':team_id', teamId)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get files from a Figma project
 */
export const getProjectFiles = async (params: FigmaGetProjectFilesParams): Promise<FigmaProjectFilesResponse> => {
    try {
        const { token, projectId } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.projectFiles.replace(':project_id', projectId)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get components from a Figma team
 */
export const getTeamComponents = async (params: FigmaGetTeamComponentsParams): Promise<FigmaComponentsResponse> => {
    try {
        const { token, teamId } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.teamComponents.replace(':team_id', teamId)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get components from a Figma file
 */
export const getFileComponents = async (params: FigmaGetFileComponentsParams): Promise<FigmaComponentsResponse> => {
    try {
        const { token, fileKey } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.fileComponents.replace(':file_key', fileKey)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get component sets from a Figma file
 */
export const getComponentSets = async (params: FigmaGetComponentSetsParams): Promise<FigmaComponentSetsResponse> => {
    try {
        const { token, fileKey } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.componentSets.replace(':file_key', fileKey)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get styles from a Figma file
 */
export const getStyles = async (params: FigmaGetStylesParams): Promise<FigmaStylesResponse> => {
    try {
        const { token, fileKey } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.styles.replace(':file_key', fileKey)}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a webhook for a Figma team
 */
export const createWebhook = async (params: FigmaCreateWebhookParams): Promise<FigmaWebhookResponse> => {
    try {
        const { token, teamId, eventType, endpoint, passcode } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.webhooks}`;

        const response = await axios.post(url, {
            event_type: eventType,
            team_id: teamId,
            endpoint,
            passcode: passcode || `figma_passcode_${nanoid()}`
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Delete a webhook
 */
export const deleteWebhook = async (params: FigmaDeleteWebhookParams): Promise<void> => {
    try {
        const { token, webhookId } = params;

        const url = `${FIGMA_API.baseUrl}/${FIGMA_API.webhook.replace(':webhook_id', webhookId)}`;

        await axios.delete(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Figma API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};
