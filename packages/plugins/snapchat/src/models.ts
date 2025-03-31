// Snapchat data models

export interface SnapchatAd {
    id: string;
    name: string;
    status: string;
    type: string;
    creativeUrl: string;
    startTime: string;
    endTime: string;
    dailyBudget: number;
    lifetimeBudget: number;
    impressions: number;
    swipes: number;
    spends: number;
}

export interface SnapchatCampaign {
    id: string;
    name: string;
    status: string;
    startTime: string;
    endTime: string;
    dailyBudget: number;
    lifetimeBudget: number;
    objective: string;
}

export interface SnapchatAdAccount {
    id: string;
    name: string;
    type: string;
    status: string;
    currency: string;
    timezone: string;
    advertiserId: string;
    organizationId: string;
}

export interface SnapchatCreative {
    id: string;
    name: string;
    type: string;
    status: string;
    brandName: string;
    headline: string;
    topSnapMediaId: string;
    topSnapCropPosition: string;
    webViewUrl: string;
    appInstallUrl: string;
    callToAction: string;
}

export interface SnapchatCreateAdParams {
    token: string;
    adAccountId: string;
    campaignId: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED';
    creativeId: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    startTime?: string;
    endTime?: string;
}

export interface SnapchatCreateCampaignParams {
    token: string;
    adAccountId: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED';
    objective: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    startTime?: string;
    endTime?: string;
}

export interface SnapchatCreateCreativeParams {
    token: string;
    adAccountId: string;
    name: string;
    type: 'WEB_VIEW' | 'APP_INSTALL';
    brandName: string;
    headline: string;
    topSnapMediaId: string;
    webViewUrl?: string;
    appInstallUrl?: string;
    callToAction?: string;
}

export interface SnapchatGetAdsParams {
    token: string;
    adAccountId: string;
    campaignId?: string;
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    maxResults?: number;
}

export interface SnapchatGetCampaignsParams {
    token: string;
    adAccountId: string;
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    maxResults?: number;
}

export interface SnapchatGetAdAccountsParams {
    token: string;
    maxResults?: number;
}
