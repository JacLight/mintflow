// Facebook data models

export interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
}

export interface FacebookPageDropdown {
    id: string;
    accessToken: string;
}

export interface FacebookPostParams {
    token: string;
    pageId: string;
    message: string;
    link?: string;
}

export interface FacebookPhotoPostParams {
    token: string;
    pageId: string;
    caption?: string;
    photoUrl: string;
}

export interface FacebookVideoPostParams {
    token: string;
    pageId: string;
    title?: string;
    description?: string;
    videoUrl: string;
}
