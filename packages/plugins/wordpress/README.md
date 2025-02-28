# WordPress Plugin for MintFlow

This plugin provides integration with WordPress, the world's most popular content management system. It allows you to create, retrieve, and update posts and pages, as well as receive triggers when new content is published.

## Features

### Actions

- **Create Post**: Create a new post on WordPress with support for custom fields, featured media, and more
- **Get Post**: Retrieve a post from WordPress by ID
- **Update Post**: Update an existing post on WordPress
- **Create Page**: Create a new page on WordPress with support for hierarchical structure

### Triggers

- **New Post**: Triggers when a new post is published on WordPress

## Authentication

This plugin requires Basic Authentication to connect to WordPress. You'll need to install the [Basic Authentication plugin](https://github.com/WP-API/Basic-Auth) on your WordPress site.

### Setup Instructions

1. Download the plugin from: <https://github.com/WP-API/Basic-Auth> (Click on Code -> Download Zip)
2. Log in to your WordPress dashboard
3. Go to "Plugins" and click "Add New"
4. Choose "Upload Plugin" and select the downloaded file
5. Install and activate the plugin

## Usage

### Create Post

Creates a new post on WordPress.

**Input:**

- `accessToken`: Authentication credentials (username, password, websiteUrl)
- `title`: Title of the post
- `content`: Content of the post (supports HTML)
- `slug`: (Optional) URL slug for the post
- `date`: (Optional) Post publish date (ISO-8601 format)
- `featuredMediaFile`: (Optional) File to upload as featured image
- `tags`: (Optional) Post tags
- `categories`: (Optional) Post categories
- `featuredMedia`: (Optional) ID of an existing media to use as featured image
- `status`: (Optional) Post status ('publish', 'future', 'draft', 'pending', 'private', 'trash')
- `excerpt`: (Optional) Post excerpt
- `commentStatus`: (Optional) Whether to allow comments
- `pingStatus`: (Optional) Whether to allow pingbacks and trackbacks
- `acfFields`: (Optional) Advanced Custom Fields values

**Output:**

- `id`: ID of the created post
- `title`: Title of the created post
- `slug`: Slug of the created post
- `link`: URL of the created post
- `error`: Error message if the operation failed

### Get Post

Retrieves a post from WordPress by ID.

**Input:**

- `accessToken`: Authentication credentials (username, password, websiteUrl)
- `postId`: ID of the post to retrieve

**Output:**

- `id`: ID of the post
- `title`: Title of the post
- `content`: Content of the post
- `excerpt`: Excerpt of the post
- `slug`: Slug of the post
- `date`: Publication date of the post
- `status`: Status of the post
- `link`: URL of the post
- `author`: Author ID of the post
- `featuredMedia`: Featured media ID of the post
- `categories`: Categories of the post
- `tags`: Tags of the post
- `error`: Error message if the operation failed

### Update Post

Updates an existing post on WordPress.

**Input:**

- `accessToken`: Authentication credentials (username, password, websiteUrl)
- `postId`: ID of the post to update
- `title`: (Optional) New title for the post
- `content`: (Optional) New content for the post
- `slug`: (Optional) New URL slug for the post
- `date`: (Optional) New publish date
- `featuredMediaFile`: (Optional) New file to upload as featured image
- `tags`: (Optional) New post tags
- `categories`: (Optional) New post categories
- `featuredMedia`: (Optional) New ID of an existing media to use as featured image
- `status`: (Optional) New post status
- `excerpt`: (Optional) New post excerpt
- `commentStatus`: (Optional) Whether to allow comments
- `pingStatus`: (Optional) Whether to allow pingbacks and trackbacks
- `acfFields`: (Optional) New Advanced Custom Fields values

**Output:**

- `id`: ID of the updated post
- `title`: Title of the updated post
- `slug`: Slug of the updated post
- `link`: URL of the updated post
- `error`: Error message if the operation failed

### Create Page

Creates a new page on WordPress.

**Input:**

- `accessToken`: Authentication credentials (username, password, websiteUrl)
- `title`: Title of the page
- `content`: Content of the page (supports HTML)
- `slug`: (Optional) URL slug for the page
- `date`: (Optional) Page publish date (ISO-8601 format)
- `featuredMediaFile`: (Optional) File to upload as featured image
- `featuredMedia`: (Optional) ID of an existing media to use as featured image
- `status`: (Optional) Page status
- `excerpt`: (Optional) Page excerpt
- `commentStatus`: (Optional) Whether to allow comments
- `pingStatus`: (Optional) Whether to allow pingbacks and trackbacks
- `parent`: (Optional) ID of the parent page
- `menuOrder`: (Optional) Order in which the page should appear in menus
- `template`: (Optional) Template file to use for the page
- `acfFields`: (Optional) Advanced Custom Fields values

**Output:**

- `id`: ID of the created page
- `title`: Title of the created page
- `slug`: Slug of the created page
- `link`: URL of the created page
- `error`: Error message if the operation failed

### New Post Trigger

Triggers when a new post is published on WordPress.

**Input:**

- `accessToken`: Authentication credentials (username, password, websiteUrl)
- `authors`: (Optional) Filter posts by specific author IDs (comma-separated)
- `pollingInterval`: (Optional) How often to check for new posts (in minutes)

**Output:**

- `id`: ID of the new post
- `title`: Title of the new post
- `content`: Content of the new post
- `excerpt`: Excerpt of the new post
- `slug`: Slug of the new post
- `date`: Publication date of the new post
- `status`: Status of the new post
- `link`: URL of the new post
- `author`: Author ID of the new post
- `featuredMedia`: Featured media ID of the new post
- `categories`: Categories of the new post
- `tags`: Tags of the new post

## Requirements

- WordPress 4.7 or higher
- WordPress REST API enabled
- Basic Authentication plugin installed and activated

## Limitations

- This plugin uses Basic Authentication, which is not recommended for production environments without SSL
- Some features may require specific WordPress plugins (e.g., Advanced Custom Fields)
- The WordPress REST API must be accessible from the MintFlow server

## Resources

- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [WordPress Basic Authentication Plugin](https://github.com/WP-API/Basic-Auth)
- [Advanced Custom Fields](https://www.advancedcustomfields.com/)
