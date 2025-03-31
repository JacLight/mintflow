# Jira Cloud Plugin for MintFlow

The Jira Cloud plugin provides integration with Atlassian's Jira Cloud, allowing you to create, update, search, and manage issues, comments, and more.

## Features

- **Issue Management**: Create, update, get, and search for issues
- **Comment Management**: Add, update, delete, and retrieve comments on issues
- **User Management**: Find users and assign issues to them
- **Issue Linking**: Link related issues together
- **Attachment Handling**: Add attachments to issues

## Authentication

This plugin requires Jira Cloud API authentication. You'll need:

1. Your Jira Cloud instance URL (e.g., <https://your-domain.atlassian.net>)
2. Your Atlassian account email address
3. An API token generated from your Atlassian account

To generate an API token:

1. Log in to <https://id.atlassian.com/manage-profile/security/api-tokens>
2. Click "Create API token"
3. Give your token a name and click "Create"
4. Copy the token (you won't be able to see it again)

## Usage

### Create Issue

Create a new issue in a Jira project:

```json
{
  "action": "create_issue",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "projectId": "10000",
  "issueTypeId": "10001",
  "summary": "Bug: Application crashes on startup",
  "description": "The application crashes immediately after launching on Windows 10."
}
```

### Update Issue

Update an existing issue:

```json
{
  "action": "update_issue",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "summary": "Updated: Application crashes on startup",
  "description": "The application crashes immediately after launching on Windows 10 and macOS."
}
```

### Get Issue

Retrieve details of an issue:

```json
{
  "action": "get_issue",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123"
}
```

### Search Issues

Search for issues using JQL (Jira Query Language):

```json
{
  "action": "search_issues",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "jql": "project = PROJ AND status = 'In Progress'",
  "maxResults": 50
}
```

### Add Comment

Add a comment to an issue:

```json
{
  "action": "add_comment",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "comment": "This is a comment on the issue."
}
```

### Update Comment

Update an existing comment:

```json
{
  "action": "update_comment",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "commentId": "10001",
  "comment": "This is an updated comment."
}
```

### Delete Comment

Delete a comment from an issue:

```json
{
  "action": "delete_comment",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "commentId": "10001"
}
```

### Get Comments

Retrieve all comments on an issue:

```json
{
  "action": "get_comments",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123"
}
```

### Assign Issue

Assign an issue to a user:

```json
{
  "action": "assign_issue",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "assignee": "user-account-id"
}
```

### Add Watcher

Add a user as a watcher to an issue:

```json
{
  "action": "add_watcher",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "accountId": "user-account-id"
}
```

### Find User

Search for users in Jira:

```json
{
  "action": "find_user",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "query": "john.doe"
}
```

### Link Issues

Create a link between two issues:

```json
{
  "action": "link_issues",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "inwardIssueKey": "PROJ-123",
  "outwardIssueKey": "PROJ-456",
  "linkTypeId": "10000",
  "comment": "These issues are related."
}
```

### Add Attachment

Add an attachment to an issue:

```json
{
  "action": "add_attachment",
  "instanceUrl": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token",
  "issueIdOrKey": "PROJ-123",
  "filename": "screenshot.png",
  "content": "base64-encoded-content-or-text-content"
}
```

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Jira API errors

## Limitations

- The plugin requires a valid Jira Cloud API token, which does not expire but can be revoked.
- Some operations may require specific Jira permissions.
- The plugin uses Jira Cloud REST API v3, which may not be compatible with Jira Server installations.

## Resources

- [Jira Cloud REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Jira Query Language (JQL) Reference](https://support.atlassian.com/jira-software-cloud/docs/advanced-search-reference-jql-fields/)
- [Atlassian API Token Management](https://id.atlassian.com/manage-profile/security/api-tokens)
