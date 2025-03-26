import { createPostAction } from './actions/create-post.js';
import { getPostAction } from './actions/get-post.js';
import { updatePostAction } from './actions/update-post.js';
import { createPageAction } from './actions/create-page.js';
import { newPostTrigger } from './triggers/new-post.js';

const wordpressPlugin = {
    name: "wordpress",
    displayName: "WordPress",
    description: "Open-source website creation software",
    icon: "https://cdn.activepieces.com/pieces/wordpress.png",
    groups: ["integration"],
    tags: ["integration", "connector", "api", "service", "platform"],
    version: '1.0.0',
    actions: [
        createPostAction,
        getPostAction,
        updatePostAction,
        createPageAction
    ],
    triggers: [
        newPostTrigger
    ]
};

export default wordpressPlugin;

// Export individual actions and triggers for direct use
export {
    createPostAction,
    getPostAction,
    updatePostAction,
    createPageAction,
    newPostTrigger
};
