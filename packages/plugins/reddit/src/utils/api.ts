import axios from 'axios';

/**
 * Reddit API client for making authenticated requests
 */
export class RedditClient {
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private userAgent: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Create a new Reddit API client
   * @param auth Authentication details
   */
  constructor(auth: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    userAgent: string;
  }) {
    this.clientId = auth.clientId;
    this.clientSecret = auth.clientSecret;
    this.username = auth.username;
    this.password = auth.password;
    this.userAgent = auth.userAgent;
  }

  /**
   * Get an access token for the Reddit API
   * @returns Access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we already have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios({
        method: 'post',
        url: 'https://www.reddit.com/api/v1/access_token',
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.userAgent,
        },
        data: new URLSearchParams({
          grant_type: 'password',
          username: this.username,
          password: this.password,
        }).toString(),
      });

      const token = response.data.access_token;
      if (!token) {
        throw new Error('No access token received from Reddit API');
      }
      
      this.accessToken = token;
      // Set token expiry (subtract 60 seconds to be safe)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      return token;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Reddit API authentication error: ${error.response.status} - ${
            error.response.data.error || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Reddit API: ${error.message}`);
      } else {
        throw new Error(`Error authenticating with Reddit API: ${error.message}`);
      }
    }
  }

  /**
   * Make a request to the Reddit API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @param params Query parameters
   * @returns API response
   */
  async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, string>
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = endpoint.startsWith('https://') 
        ? endpoint 
        : `https://oauth.reddit.com${endpoint}`;
      
      const response = await axios({
        method,
        url,
        data,
        params,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': this.userAgent,
          'Content-Type': 'application/json',
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Reddit API error: ${error.response.status} - ${
            error.response.data.error || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error(`No response received from Reddit API: ${error.message}`);
      } else {
        throw new Error(`Error making request to Reddit API: ${error.message}`);
      }
    }
  }

  /**
   * Get information about a subreddit
   * @param subreddit Subreddit name
   * @returns Subreddit information
   */
  async getSubreddit(subreddit: string): Promise<any> {
    return this.makeRequest('GET', `/r/${subreddit}/about`);
  }

  /**
   * Get posts from a subreddit
   * @param subreddit Subreddit name
   * @param limit Maximum number of posts to get
   * @param sort Sort method (hot, new, top, rising)
   * @param timeframe Timeframe for top posts (hour, day, week, month, year, all)
   * @returns List of posts
   */
  async getSubredditPosts(
    subreddit: string,
    limit: number = 25,
    sort: 'hot' | 'new' | 'top' | 'rising' = 'hot',
    timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<any> {
    const params: Record<string, string> = {
      limit: limit.toString(),
    };

    if (sort === 'top' && timeframe) {
      params.t = timeframe;
    }

    return this.makeRequest('GET', `/r/${subreddit}/${sort}`, undefined, params);
  }

  /**
   * Get a specific post by ID
   * @param postId Post ID
   * @returns Post information
   */
  async getPost(postId: string): Promise<any> {
    // Make sure the ID doesn't include the t3_ prefix
    const id = postId.startsWith('t3_') ? postId.substring(3) : postId;
    return this.makeRequest('GET', `/api/info?id=t3_${id}`);
  }

  /**
   * Get comments for a post
   * @param postId Post ID
   * @param subreddit Subreddit name
   * @param sort Sort method (confidence, top, new, controversial, old, random, qa)
   * @param limit Maximum number of comments to get
   * @returns List of comments
   */
  async getPostComments(
    postId: string,
    subreddit: string,
    sort: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'random' | 'qa' = 'confidence',
    limit: number = 25
  ): Promise<any> {
    // Make sure the ID doesn't include the t3_ prefix
    const id = postId.startsWith('t3_') ? postId.substring(3) : postId;
    
    const params: Record<string, string> = {
      sort,
      limit: limit.toString(),
    };

    return this.makeRequest('GET', `/r/${subreddit}/comments/${id}`, undefined, params);
  }

  /**
   * Submit a new post to a subreddit
   * @param subreddit Subreddit name
   * @param title Post title
   * @param content Post content (text or URL)
   * @param kind Post kind (self, link)
   * @returns Submission response
   */
  async submitPost(
    subreddit: string,
    title: string,
    content: string,
    kind: 'self' | 'link'
  ): Promise<any> {
    const data = new URLSearchParams({
      sr: subreddit,
      title,
      kind,
      ...(kind === 'self' ? { text: content } : { url: content }),
      api_type: 'json',
    });

    return this.makeRequest('POST', '/api/submit', data.toString(), undefined);
  }

  /**
   * Submit a comment on a post or another comment
   * @param parentId ID of the parent post or comment
   * @param text Comment text
   * @returns Comment response
   */
  async submitComment(parentId: string, text: string): Promise<any> {
    const data = new URLSearchParams({
      thing_id: parentId,
      text,
      api_type: 'json',
    });

    return this.makeRequest('POST', '/api/comment', data.toString(), undefined);
  }

  /**
   * Get information about the current user
   * @returns User information
   */
  async getMe(): Promise<any> {
    return this.makeRequest('GET', '/api/v1/me');
  }

  /**
   * Get a user's profile
   * @param username Username
   * @returns User profile
   */
  async getUserProfile(username: string): Promise<any> {
    return this.makeRequest('GET', `/user/${username}/about`);
  }

  /**
   * Get a user's posts
   * @param username Username
   * @param limit Maximum number of posts to get
   * @param sort Sort method (hot, new, top)
   * @param timeframe Timeframe for top posts (hour, day, week, month, year, all)
   * @returns List of posts
   */
  async getUserPosts(
    username: string,
    limit: number = 25,
    sort: 'hot' | 'new' | 'top' = 'new',
    timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<any> {
    const params: Record<string, string> = {
      limit: limit.toString(),
    };

    if (sort === 'top' && timeframe) {
      params.t = timeframe;
    }

    return this.makeRequest('GET', `/user/${username}/submitted?sort=${sort}`, undefined, params);
  }

  /**
   * Get a user's comments
   * @param username Username
   * @param limit Maximum number of comments to get
   * @param sort Sort method (hot, new, top)
   * @param timeframe Timeframe for top comments (hour, day, week, month, year, all)
   * @returns List of comments
   */
  async getUserComments(
    username: string,
    limit: number = 25,
    sort: 'hot' | 'new' | 'top' = 'new',
    timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<any> {
    const params: Record<string, string> = {
      limit: limit.toString(),
    };

    if (sort === 'top' && timeframe) {
      params.t = timeframe;
    }

    return this.makeRequest('GET', `/user/${username}/comments?sort=${sort}`, undefined, params);
  }

  /**
   * Search Reddit
   * @param query Search query
   * @param subreddit Optional subreddit to search in
   * @param sort Sort method (relevance, hot, top, new, comments)
   * @param timeframe Timeframe for top results (hour, day, week, month, year, all)
   * @param limit Maximum number of results to get
   * @returns Search results
   */
  async search(
    query: string,
    subreddit?: string,
    sort: 'relevance' | 'hot' | 'top' | 'new' | 'comments' = 'relevance',
    timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all',
    limit: number = 25
  ): Promise<any> {
    const params: Record<string, string> = {
      q: query,
      sort,
      limit: limit.toString(),
    };

    if (sort === 'top' && timeframe) {
      params.t = timeframe;
    }

    const endpoint = subreddit ? `/r/${subreddit}/search` : '/search';
    return this.makeRequest('GET', endpoint, undefined, params);
  }

  /**
   * Make a custom API call to Reddit
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param data Request data
   * @param params Query parameters
   * @returns API response
   */
  async makeCustomApiCall(
    endpoint: string,
    method: string,
    data?: any,
    params?: Record<string, string>
  ): Promise<any> {
    return this.makeRequest(method, endpoint, data, params);
  }
}
