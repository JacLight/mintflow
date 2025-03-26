import {
    createAd,
    createCampaign,
    createCreative,
    getAds,
    getCampaigns,
    getAdAccounts
} from './utils.js';

const snapchatPlugin = {
    name: "Snapchat",
    icon: "",
    description: "Multimedia messaging app for sharing photos, videos, and ads",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
    id: "snapchat",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_ad',
                    'create_campaign',
                    'create_creative',
                    'get_ads',
                    'get_campaigns',
                    'get_ad_accounts'
                ],
                description: 'Action to perform on Snapchat',
            },
            token: {
                type: 'string',
                description: 'Snapchat API OAuth token',
            },
            // Fields for ad account operations
            adAccountId: {
                type: 'string',
                description: 'Snapchat Ad Account ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_ads', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_campaigns', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for ad operations
            campaignId: {
                type: 'string',
                description: 'Snapchat Campaign ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_ads', valueB: '{{action}}', action: 'hide' },
                ],
            },
            creativeId: {
                type: 'string',
                description: 'Snapchat Creative ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for creative operations
            name: {
                type: 'string',
                description: 'Name for the ad, campaign, or creative',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'PAUSED', 'COMPLETED'],
                description: 'Status for the ad or campaign',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_ads', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_campaigns', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for campaign operations
            objective: {
                type: 'string',
                description: 'Campaign objective',
                rules: [
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for budget
            dailyBudget: {
                type: 'number',
                description: 'Daily budget in micro-currency (e.g., 1000000 = $1.00 USD)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                ],
            },
            lifetimeBudget: {
                type: 'number',
                description: 'Lifetime budget in micro-currency (e.g., 1000000 = $1.00 USD)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for scheduling
            startTime: {
                type: 'string',
                description: 'Start time in ISO 8601 format (e.g., 2023-01-01T00:00:00Z)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                ],
            },
            endTime: {
                type: 'string',
                description: 'End time in ISO 8601 format (e.g., 2023-12-31T23:59:59Z)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ad', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_campaign', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for creative operations
            type: {
                type: 'string',
                enum: ['WEB_VIEW', 'APP_INSTALL'],
                description: 'Type of creative',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            brandName: {
                type: 'string',
                description: 'Brand name for the creative',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            headline: {
                type: 'string',
                description: 'Headline for the creative',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            topSnapMediaId: {
                type: 'string',
                description: 'Media ID for the top snap',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webViewUrl: {
                type: 'string',
                description: 'URL for web view creatives',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            appInstallUrl: {
                type: 'string',
                description: 'URL for app install creatives',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            callToAction: {
                type: 'string',
                description: 'Call to action text',
                rules: [
                    { operation: 'notEqual', valueA: 'create_creative', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Common fields
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 50)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_ads', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_campaigns', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_ad_accounts', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_ad',
        token: 'your-snapchat-api-token',
        adAccountId: '12345678-1234-1234-1234-123456789012',
        campaignId: '12345678-1234-1234-1234-123456789012',
        creativeId: '12345678-1234-1234-1234-123456789012',
        name: 'My Snapchat Ad',
        status: 'ACTIVE',
        dailyBudget: 1000000
    },
    exampleOutput: {
        id: '12345678-1234-1234-1234-123456789012',
        name: 'My Snapchat Ad',
        status: 'ACTIVE',
        type: 'SNAP_AD',
        creativeUrl: 'https://www.snapchat.com/ad/12345678-1234-1234-1234-123456789012',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-12-31T23:59:59Z',
        dailyBudget: 1000000,
        lifetimeBudget: 0,
        impressions: 0,
        swipes: 0,
        spends: 0
    },
    documentation: "https://developers.snapchat.com/api/docs/",
    method: "exec",
    actions: [
        {
            name: 'snapchat',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_ad': {
                        const {
                            adAccountId,
                            campaignId,
                            name,
                            status,
                            creativeId,
                            dailyBudget,
                            lifetimeBudget,
                            startTime,
                            endTime
                        } = input;

                        if (!adAccountId || !campaignId || !name || !status || !creativeId) {
                            throw new Error('Missing required parameters: adAccountId, campaignId, name, status, creativeId');
                        }

                        return await createAd({
                            token,
                            adAccountId,
                            campaignId,
                            name,
                            status,
                            creativeId,
                            dailyBudget,
                            lifetimeBudget,
                            startTime,
                            endTime
                        });
                    }

                    case 'create_campaign': {
                        const {
                            adAccountId,
                            name,
                            status,
                            objective,
                            dailyBudget,
                            lifetimeBudget,
                            startTime,
                            endTime
                        } = input;

                        if (!adAccountId || !name || !status || !objective) {
                            throw new Error('Missing required parameters: adAccountId, name, status, objective');
                        }

                        return await createCampaign({
                            token,
                            adAccountId,
                            name,
                            status,
                            objective,
                            dailyBudget,
                            lifetimeBudget,
                            startTime,
                            endTime
                        });
                    }

                    case 'create_creative': {
                        const {
                            adAccountId,
                            name,
                            type,
                            brandName,
                            headline,
                            topSnapMediaId,
                            webViewUrl,
                            appInstallUrl,
                            callToAction
                        } = input;

                        if (!adAccountId || !name || !type || !brandName || !headline || !topSnapMediaId) {
                            throw new Error('Missing required parameters: adAccountId, name, type, brandName, headline, topSnapMediaId');
                        }

                        return await createCreative({
                            token,
                            adAccountId,
                            name,
                            type,
                            brandName,
                            headline,
                            topSnapMediaId,
                            webViewUrl,
                            appInstallUrl,
                            callToAction
                        });
                    }

                    case 'get_ads': {
                        const { adAccountId, campaignId, status, maxResults } = input;

                        if (!adAccountId) {
                            throw new Error('Missing required parameter: adAccountId');
                        }

                        return await getAds({
                            token,
                            adAccountId,
                            campaignId,
                            status,
                            maxResults
                        });
                    }

                    case 'get_campaigns': {
                        const { adAccountId, status, maxResults } = input;

                        if (!adAccountId) {
                            throw new Error('Missing required parameter: adAccountId');
                        }

                        return await getCampaigns({
                            token,
                            adAccountId,
                            status,
                            maxResults
                        });
                    }

                    case 'get_ad_accounts': {
                        const { maxResults } = input;

                        return await getAdAccounts({
                            token,
                            maxResults
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default snapchatPlugin;
