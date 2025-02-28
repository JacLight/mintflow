import axios from 'axios';
import {
    SnapchatAd,
    SnapchatCampaign,
    SnapchatAdAccount,
    SnapchatCreative,
    SnapchatCreateAdParams,
    SnapchatCreateCampaignParams,
    SnapchatCreateCreativeParams,
    SnapchatGetAdsParams,
    SnapchatGetCampaignsParams,
    SnapchatGetAdAccountsParams
} from './models';

const BASE_URL = 'https://adsapi.snapchat.com/v1';

/**
 * Create an ad on Snapchat
 */
export const createAd = async (params: SnapchatCreateAdParams): Promise<SnapchatAd> => {
    try {
        const {
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
        } = params;

        const requestBody: any = {
            campaign_id: campaignId,
            name,
            status,
            creative_id: creativeId
        };

        if (dailyBudget) {
            requestBody.daily_budget = dailyBudget;
        }

        if (lifetimeBudget) {
            requestBody.lifetime_budget = lifetimeBudget;
        }

        if (startTime) {
            requestBody.start_time = startTime;
        }

        if (endTime) {
            requestBody.end_time = endTime;
        }

        const response = await axios.post(
            `${BASE_URL}/adaccounts/${adAccountId}/ads`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return mapAdResponse(response.data.ad);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Snapchat API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a campaign on Snapchat
 */
export const createCampaign = async (params: SnapchatCreateCampaignParams): Promise<SnapchatCampaign> => {
    try {
        const {
            token,
            adAccountId,
            name,
            status,
            objective,
            dailyBudget,
            lifetimeBudget,
            startTime,
            endTime
        } = params;

        const requestBody: any = {
            name,
            status,
            objective
        };

        if (dailyBudget) {
            requestBody.daily_budget = dailyBudget;
        }

        if (lifetimeBudget) {
            requestBody.lifetime_budget = lifetimeBudget;
        }

        if (startTime) {
            requestBody.start_time = startTime;
        }

        if (endTime) {
            requestBody.end_time = endTime;
        }

        const response = await axios.post(
            `${BASE_URL}/adaccounts/${adAccountId}/campaigns`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return mapCampaignResponse(response.data.campaign);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Snapchat API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a creative on Snapchat
 */
export const createCreative = async (params: SnapchatCreateCreativeParams): Promise<SnapchatCreative> => {
    try {
        const {
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
        } = params;

        const requestBody: any = {
            name,
            type,
            brand_name: brandName,
            headline,
            top_snap_media_id: topSnapMediaId
        };

        if (type === 'WEB_VIEW' && webViewUrl) {
            requestBody.web_view_url = webViewUrl;
        }

        if (type === 'APP_INSTALL' && appInstallUrl) {
            requestBody.app_install_url = appInstallUrl;
        }

        if (callToAction) {
            requestBody.call_to_action = callToAction;
        }

        const response = await axios.post(
            `${BASE_URL}/adaccounts/${adAccountId}/creatives`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return mapCreativeResponse(response.data.creative);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Snapchat API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get ads from a Snapchat ad account
 */
export const getAds = async (params: SnapchatGetAdsParams): Promise<SnapchatAd[]> => {
    try {
        const { token, adAccountId, campaignId, status, maxResults = 50 } = params;

        const queryParams: any = {
            limit: maxResults
        };

        if (campaignId) {
            queryParams.campaign_id = campaignId;
        }

        if (status) {
            queryParams.status = status;
        }

        const response = await axios.get(
            `${BASE_URL}/adaccounts/${adAccountId}/ads`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.ads.map((ad: any) => mapAdResponse(ad));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Snapchat API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get campaigns from a Snapchat ad account
 */
export const getCampaigns = async (params: SnapchatGetCampaignsParams): Promise<SnapchatCampaign[]> => {
    try {
        const { token, adAccountId, status, maxResults = 50 } = params;

        const queryParams: any = {
            limit: maxResults
        };

        if (status) {
            queryParams.status = status;
        }

        const response = await axios.get(
            `${BASE_URL}/adaccounts/${adAccountId}/campaigns`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.campaigns.map((campaign: any) => mapCampaignResponse(campaign));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Snapchat API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get ad accounts from Snapchat
 */
export const getAdAccounts = async (params: SnapchatGetAdAccountsParams): Promise<SnapchatAdAccount[]> => {
    try {
        const { token, maxResults = 50 } = params;

        const response = await axios.get(
            `${BASE_URL}/me/adaccounts`,
            {
                params: {
                    limit: maxResults
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.adaccounts.map((adAccount: any) => mapAdAccountResponse(adAccount));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Snapchat API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Map Snapchat API ad response to our model
 */
function mapAdResponse(ad: any): SnapchatAd {
    return {
        id: ad.id,
        name: ad.name,
        status: ad.status,
        type: ad.type,
        creativeUrl: ad.creative_url,
        startTime: ad.start_time,
        endTime: ad.end_time,
        dailyBudget: ad.daily_budget,
        lifetimeBudget: ad.lifetime_budget,
        impressions: ad.stats?.impressions || 0,
        swipes: ad.stats?.swipes || 0,
        spends: ad.stats?.spends || 0
    };
}

/**
 * Map Snapchat API campaign response to our model
 */
function mapCampaignResponse(campaign: any): SnapchatCampaign {
    return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        startTime: campaign.start_time,
        endTime: campaign.end_time,
        dailyBudget: campaign.daily_budget,
        lifetimeBudget: campaign.lifetime_budget,
        objective: campaign.objective
    };
}

/**
 * Map Snapchat API ad account response to our model
 */
function mapAdAccountResponse(adAccount: any): SnapchatAdAccount {
    return {
        id: adAccount.id,
        name: adAccount.name,
        type: adAccount.type,
        status: adAccount.status,
        currency: adAccount.currency,
        timezone: adAccount.timezone,
        advertiserId: adAccount.advertiser_id,
        organizationId: adAccount.organization_id
    };
}

/**
 * Map Snapchat API creative response to our model
 */
function mapCreativeResponse(creative: any): SnapchatCreative {
    return {
        id: creative.id,
        name: creative.name,
        type: creative.type,
        status: creative.status,
        brandName: creative.brand_name,
        headline: creative.headline,
        topSnapMediaId: creative.top_snap_media_id,
        topSnapCropPosition: creative.top_snap_crop_position,
        webViewUrl: creative.web_view_url,
        appInstallUrl: creative.app_install_url,
        callToAction: creative.call_to_action
    };
}
