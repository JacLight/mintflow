// Pinterest data models

export interface PinterestPin {
    id: string;
    title: string;
    description: string;
    link: string;
    url: string;
    media: {
        images: {
            original: {
                url: string;
                width: number;
                height: number;
            }
        }
    };
    created_at: string;
    board: {
        id: string;
        name: string;
        url: string;
    };
}

export interface PinterestBoard {
    id: string;
    name: string;
    description: string;
    url: string;
    privacy: string;
    pin_count: number;
    follower_count: number;
    created_at: string;
}

export interface PinterestUser {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    website_url: string;
    profile_image: string;
    pin_count: number;
    follower_count: number;
    following_count: number;
}

export interface PinterestCreatePinParams {
    token: string;
    boardId: string;
    title: string;
    description?: string;
    imageUrl: string;
    link?: string;
    altText?: string;
}

export interface PinterestCreateBoardParams {
    token: string;
    name: string;
    description?: string;
    privacy?: 'PUBLIC' | 'PROTECTED' | 'SECRET';
}

export interface PinterestGetPinsParams {
    token: string;
    boardId: string;
    maxResults?: number;
}

export interface PinterestGetBoardsParams {
    token: string;
    maxResults?: number;
}

export interface PinterestSearchParams {
    token: string;
    query: string;
    maxResults?: number;
}
