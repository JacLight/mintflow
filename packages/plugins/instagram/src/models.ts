// Instagram data models

export interface InstagramBusinessAccount {
    id: string;
    name: string;
    access_token: string;
}

export interface InstagramAccountDropdown {
    id: string;
    accessToken: string;
}

export interface InstagramPhotoPostParams {
    token: string;
    accountId: string;
    caption?: string;
    photoUrl: string;
}

export interface InstagramReelPostParams {
    token: string;
    accountId: string;
    caption?: string;
    videoUrl: string;
}
