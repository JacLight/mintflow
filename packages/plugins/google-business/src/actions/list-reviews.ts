import { commonSchema, googleApiUrls, googleBusinessUtils } from '../common.js';
import axios from 'axios';

export const listReviews = {
    name: 'list_reviews',
    displayName: 'List Reviews',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            auth: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' }
                },
                required: ['access_token']
            },
            locationName: {
                type: 'string',
                description: 'The name of the location to list reviews for (format: accounts/*/locations/*)'
            },
            pageSize: {
                type: 'number',
                description: 'The maximum number of reviews to return per page (max: 50)'
            },
            pageToken: {
                type: 'string',
                description: 'The page token from a previous response for pagination'
            },
            orderBy: {
                type: 'string',
                description: 'The order to sort the reviews by (e.g., "updateTime desc")'
            }
        },
        required: ['auth', 'locationName']
    },
    outputSchema: {
        type: 'object',
        properties: {
            reviews: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        reviewId: { type: 'string' },
                        reviewer: { 
                            type: 'object',
                            properties: {
                                profilePhotoUrl: { type: 'string' },
                                displayName: { type: 'string' },
                                isAnonymous: { type: 'boolean' }
                            }
                        },
                        starRating: { type: 'string' },
                        comment: { type: 'string' },
                        createTime: { type: 'string' },
                        updateTime: { type: 'string' },
                        reviewReply: { 
                            type: 'object',
                            properties: {
                                comment: { type: 'string' },
                                updateTime: { type: 'string' }
                            }
                        }
                    }
                }
            },
            nextPageToken: { type: 'string' },
            totalReviewCount: { type: 'number' },
            averageRating: { type: 'number' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        locationName: 'accounts/123456789/locations/987654321',
        pageSize: 20,
        orderBy: 'updateTime desc'
    },
    exampleOutput: {
        reviews: [
            {
                name: 'accounts/123456789/locations/987654321/reviews/12345',
                reviewId: '12345',
                reviewer: {
                    profilePhotoUrl: 'https://example.com/photo.jpg',
                    displayName: 'John Doe',
                    isAnonymous: false
                },
                starRating: 'FIVE',
                comment: 'Great service and friendly staff!',
                createTime: '2023-01-10T15:01:23.045Z',
                updateTime: '2023-01-10T15:01:23.045Z',
                reviewReply: {
                    comment: 'Thank you for your feedback!',
                    updateTime: '2023-01-11T09:30:45.123Z'
                }
            }
        ],
        nextPageToken: 'token_for_next_page',
        totalReviewCount: 42,
        averageRating: 4.7
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, locationName, pageSize, pageToken, orderBy } = input;

            if (!googleBusinessUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Validate location name format
            if (!locationName.match(/accounts\/.*\/locations\/.*/)) {
                throw new Error('Invalid location name format. Expected format: accounts/*/locations/*');
            }

            // Prepare query parameters
            const params: Record<string, any> = {};
            
            if (pageSize) {
                params.pageSize = Math.min(pageSize, 50); // Max 50 per page
            } else {
                params.pageSize = 50; // Default to max
            }
            
            if (pageToken) {
                params.pageToken = pageToken;
            }
            
            if (orderBy) {
                params.orderBy = orderBy;
            } else {
                params.orderBy = 'updateTime desc'; // Default to most recent first
            }

            // Make API request
            const response = await axios.get(
                `${googleApiUrls.mybusiness}/${locationName}/reviews`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.access_token}`
                    },
                    params
                }
            );
            
            return response.data;
        } catch (error: unknown) {
            return googleBusinessUtils.handleApiError(error);
        }
    }
};
