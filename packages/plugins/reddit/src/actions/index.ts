import { customApiCall } from './custom-api-call.js';
import { getSubreddit } from './get-subreddit.js';
import { submitPost } from './submit-post.js';

export const actions = [
  customApiCall,
  getSubreddit,
  submitPost,
];
