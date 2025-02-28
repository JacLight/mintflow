# MintFlow GitHub Plugin

A MintFlow plugin for interacting with GitHub repositories, issues, and more.

## Features

- **Create Issues**: Create new issues in GitHub repositories
- **Get Issue Information**: Retrieve details about existing issues
- **Comment on Issues**: Add comments to existing issues
- **Lock/Unlock Issues**: Control the discussion state of issues
- **GraphQL Support**: Execute custom GraphQL queries against the GitHub API

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Usage

### Authentication

The GitHub plugin requires a GitHub Personal Access Token for authentication. You can create a token in your GitHub account settings:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select the necessary scopes:
   - `repo` for repository operations
   - `admin:repo_hook` for webhook operations (if needed)
   - `admin:org` for organization operations (if needed)
4. Generate the token and use it in your workflow

### Actions

#### Create Issue

Creates a new issue in a GitHub repository.

```json
{
  "action": "create_issue",
  "token": "your-github-token",
  "owner": "repository-owner",
  "repo": "repository-name",
  "title": "Issue title",
  "body": "Issue description",
  "labels": "bug,help wanted",
  "assignees": "username1,username2"
}
```

#### Get Issue Information

Retrieves information about an existing issue.

```json
{
  "action": "get_issue",
  "token": "your-github-token",
  "owner": "repository-owner",
  "repo": "repository-name",
  "issue_number": 1347
}
```

#### Create Comment

Adds a comment to an existing issue.

```json
{
  "action": "create_comment",
  "token": "your-github-token",
  "owner": "repository-owner",
  "repo": "repository-name",
  "issue_number": 1347,
  "body": "This is a comment"
}
```

#### Lock Issue

Locks an issue to prevent further comments.

```json
{
  "action": "lock_issue",
  "token": "your-github-token",
  "owner": "repository-owner",
  "repo": "repository-name",
  "issue_number": 1347
}
```

#### Unlock Issue

Unlocks a previously locked issue.

```json
{
  "action": "unlock_issue",
  "token": "your-github-token",
  "owner": "repository-owner",
  "repo": "repository-name",
  "issue_number": 1347
}
```

#### Execute GraphQL Query

Executes a custom GraphQL query against the GitHub API.

```json
{
  "action": "raw_graphql",
  "token": "your-github-token",
  "owner": "repository-owner",
  "repo": "repository-name",
  "query": "query { repository(owner: \"octocat\", name: \"hello-world\") { issues(first: 1) { nodes { id title body } } } }",
  "variables": "{}"
}
```

## Example Workflow

Here's an example of how to use the GitHub plugin in a MintFlow workflow:

```javascript
// Create an issue when a form is submitted
const formData = input.data;

// Create an issue with the form data
const issueResult = await mintflow.execute('github', {
  action: 'create_issue',
  token: process.env.GITHUB_TOKEN,
  owner: 'my-organization',
  repo: 'my-repository',
  title: `New request: ${formData.subject}`,
  body: `**From:** ${formData.name}\n**Email:** ${formData.email}\n\n${formData.message}`,
  labels: 'customer-request,needs-triage',
  assignees: 'support-team-member'
});

// Return the issue URL
return {
  issueUrl: issueResult.html_url,
  issueNumber: issueResult.number
};
```

## Error Handling

The plugin provides descriptive error messages for common issues:

- Missing required parameters
- Invalid action names
- GitHub API errors (with the original error message from GitHub)

## Security Considerations

- Never hardcode your GitHub token in your workflows. Use environment variables or a secure secret management system.
- Use the minimum required scopes for your GitHub token.
- Consider using a dedicated GitHub account or a GitHub App for production workflows.

## Development

### Building the Plugin

```bash
cd packages/plugins/github
pnpm build
```

### Running Tests

```bash
cd packages/plugins/github
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
