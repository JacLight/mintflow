import axios from 'axios';
import {
    TikTokVideo,
    TikTokUser,
    TikTokVideoListParams,
    TikTokVideoDetailsParams,
    TikTokUserDetailsParams,
    TikTokUploadVideoParams
} from './models.js';

const BASE_URL = 'https://open.tiktokapis.com/v2';

/**
 * Get videos from a user's TikTok account
 */
export const getUserVideos = async (params: TikTokVideoListParams): Promise<TikTokVideo[]> => {
    try {
        const { token, userId, maxResults = 10 } = params;

        // If userId is not provided, get the authenticated user's videos
        const targetUserId = userId || await getCurrentUserId(token);

        const response = await axios.get(`${BASE_URL}/video/list/`, {
            params: {
                user_id: targetUserId,
                max_count: maxResults
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data.videos.map((video: any) => mapVideoResponse(video));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`TikTok API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get details about a specific TikTok video
 */
export const getVideoDetails = async (params: TikTokVideoDetailsParams): Promise<TikTokVideo> => {
    try {
        const { token, videoId } = params;

        const response = await axios.get(`${BASE_URL}/video/info/`, {
            params: {
                video_id: videoId
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.data.data.video) {
            throw new Error(`Video with ID ${videoId} not found`);
        }

        return mapVideoResponse(response.data.data.video);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`TikTok API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get details about a TikTok user
 */
export const getUserDetails = async (params: TikTokUserDetailsParams): Promise<TikTokUser> => {
    try {
        const { token, userId, username } = params;

        if (!userId && !username) {
            throw new Error('Either userId or username must be provided');
        }

        let targetUserId = userId;

        // If only username is provided, we need to find the user ID first
        if (!targetUserId && username) {
            targetUserId = await getUserIdByUsername(token, username);
        }

        const response = await axios.get(`${BASE_URL}/user/info/`, {
            params: {
                user_id: targetUserId
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.data.data.user) {
            throw new Error('User not found');
        }

        const user = response.data.data.user;

        return {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            followingCount: user.following_count,
            followerCount: user.follower_count,
            likeCount: user.like_count,
            videoCount: user.video_count
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`TikTok API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Upload a video to TikTok
 */
export const uploadVideo = async (params: TikTokUploadVideoParams): Promise<any> => {
    try {
        const {
            token,
            videoUrl,
            description = '',
            privacy = 'public',
            disableComments = false,
            disableDuet = false,
            disableStitch = false
        } = params;

        // Step 1: Create an upload
        const createResponse = await axios.post(
            `${BASE_URL}/video/upload/`,
            {
                source_info: {
                    source: 'PULL_FROM_URL',
                    video_url: videoUrl
                },
                post_info: {
                    title: description,
                    privacy_level: privacy.toUpperCase(),
                    disable_comment: disableComments,
                    disable_duet: disableDuet,
                    disable_stitch: disableStitch
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const uploadId = createResponse.data.data.upload_id;

        // Step 2: Check upload status
        let status = 'IN_PROGRESS';
        let attempts = 0;
        const maxAttempts = 30; // Maximum number of attempts to check status

        while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
            await wait(2000); // Wait 2 seconds between status checks

            const statusResponse = await axios.get(`${BASE_URL}/video/query/`, {
                params: {
                    upload_id: uploadId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            status = statusResponse.data.data.upload_status;
            attempts++;

            if (status === 'FAILED') {
                throw new Error(`Video upload failed: ${statusResponse.data.data.error_message || 'Unknown error'}`);
            }
        }

        if (status !== 'SUCCEEDED') {
            throw new Error('Video upload timed out or failed');
        }

        return {
            uploadId,
            status
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`TikTok API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get the current authenticated user's ID
 */
async function getCurrentUserId(token: string): Promise<string> {
    try {
        const response = await axios.get(`${BASE_URL}/user/info/`, {
            params: {
                fields: 'id'
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data.user.id;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`TikTok API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
}

/**
 * Get a user ID by username
 */
async function getUserIdByUsername(token: string, username: string): Promise<string> {
    try {
        const response = await axios.get(`${BASE_URL}/user/find/`, {
            params: {
                username
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.data.data.user) {
            throw new Error(`User with username ${username} not found`);
        }

        return response.data.data.user.id;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`TikTok API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
}

/**
 * Map TikTok API video response to our model
 */
function mapVideoResponse(video: any): TikTokVideo {
    return {
        id: video.id,
        title: video.title,
        description: video.description,
        createTime: video.create_time,
        coverUrl: video.cover_image_url,
        shareUrl: video.share_url,
        videoUrl: video.video_url,
        duration: video.duration,
        width: video.width,
        height: video.height,
        statistics: {
            commentCount: video.statistics.comment_count,
            likeCount: video.statistics.like_count,
            shareCount: video.statistics.share_count,
            viewCount: video.statistics.view_count
        }
    };
}

/**
 * Helper function to wait for a specified number of milliseconds
 */
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
