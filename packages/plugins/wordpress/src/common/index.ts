import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';

// Types
export interface WordPressAuth {
    username: string;
    password: string;
    websiteUrl: string;
}

export interface WordPressMedia {
    id: string;
    title: { rendered: string };
}

export interface WordPressPost {
    id: string;
    date: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    slug: string;
    status: string;
    categories: string[];
    tags: string[];
    featured_media: string;
    link: string;
    author: string;
}

export interface WordPressCategory {
    id: string;
    name: string;
}

export interface WordPressTag {
    id: string;
    name: string;
}

export interface WordPressUser {
    id: string;
    name: string;
}

// Constants
const PAGE_HEADER = 'x-wp-totalpages';

// Client
export class WordPressClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;

    constructor(auth: WordPressAuth) {
        this.baseUrl = auth.websiteUrl.trim();

        // Create axios instance with authentication
        this.axiosInstance = axios.create({
            auth: {
                username: auth.username,
                password: auth.password
            },
            baseURL: `${this.baseUrl}/wp-json/wp/v2`
        });
    }

    // Posts
    async getPosts(params: {
        authors?: string;
        afterDate?: string;
        page?: number;
    } = {}) {
        const queryParams: Record<string, string> = {
            orderby: 'date',
            order: 'desc',
            before: new Date().toISOString(),
            page: (params.page || 1).toString()
        };

        if (params.afterDate) {
            queryParams.after = params.afterDate;
        }

        if (params.authors) {
            queryParams.author = params.authors;
        }

        const response = await this.axiosInstance.get('/posts', { params: queryParams });

        return {
            posts: response.data,
            totalPages: response.headers && response.headers[PAGE_HEADER]
                ? Number(response.headers[PAGE_HEADER])
                : 0
        };
    }

    async getPost(postId: string) {
        try {
            const response = await this.axiosInstance.get(`/posts/${postId}`);
            return { data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async createPost(postData: Record<string, any>) {
        try {
            const response = await this.axiosInstance.post('/posts', postData);
            return { data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updatePost(postId: string, postData: Record<string, any>) {
        try {
            const response = await this.axiosInstance.put(`/posts/${postId}`, postData);
            return { data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Pages
    async createPage(pageData: Record<string, any>) {
        try {
            const response = await this.axiosInstance.post('/pages', pageData);
            return { data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Media
    async getMedia(params: { page?: number } = {}) {
        try {
            const response = await this.axiosInstance.get('/media', {
                params: { page: (params.page || 1).toString() }
            });

            return {
                media: response.data,
                totalPages: response.headers && response.headers[PAGE_HEADER]
                    ? Number(response.headers[PAGE_HEADER])
                    : 0
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async uploadMedia(file: { filename: string; base64: string }) {
        try {
            const formData = new FormData();
            formData.append('file', Buffer.from(file.base64, 'base64'), file.filename);

            const response = await this.axiosInstance.post('/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return { data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Categories
    async getCategories(params: { page?: number } = {}) {
        try {
            const response = await this.axiosInstance.get('/categories', {
                params: { page: (params.page || 1).toString() }
            });

            return {
                categories: response.data,
                totalPages: response.headers && response.headers[PAGE_HEADER]
                    ? Number(response.headers[PAGE_HEADER])
                    : 0
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Tags
    async getTags(params: { page?: number } = {}) {
        try {
            const response = await this.axiosInstance.get('/tags', {
                params: { page: (params.page || 1).toString() }
            });

            return {
                tags: response.data,
                totalPages: response.headers && response.headers[PAGE_HEADER]
                    ? Number(response.headers[PAGE_HEADER])
                    : 0
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Users
    async getUsers() {
        try {
            const response = await this.axiosInstance.get('/users');
            return { data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Utility methods
    async validateConnection() {
        try {
            await this.axiosInstance.get('/categories');
            return true;
        } catch (error) {
            return false;
        }
    }

    async urlExists(url: string) {
        try {
            await axios.get(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    isBaseUrl(urlString: string): boolean {
        try {
            const url = new URL(urlString);
            return !url.pathname || url.pathname === '/';
        } catch (error) {
            return false;
        }
    }

    private handleError(error: any) {
        if (error.response) {
            return { error: error.response.data.message || 'API error' };
        } else if (error.request) {
            return { error: 'No response from server' };
        } else {
            return { error: error.message };
        }
    }
}

// Helper function to create a WordPress client
export function createClient(auth: WordPressAuth): WordPressClient {
    return new WordPressClient(auth);
}
