# Typeform Plugin for MintFlow

This plugin provides integration with Typeform, a platform for creating beautiful online forms and surveys.

## Authentication

The plugin uses OAuth2 authentication with Typeform's API:

- **Token URL**: `https://api.typeform.com/oauth/token`
- **Auth URL**: `https://admin.typeform.com/oauth/authorize`
- **Required Scopes**: `webhooks:write`, `forms:read`

## Triggers

### New Submission

Triggers when a form receives a new submission.

**Properties:**

- **Form**: Select the Typeform form to monitor for new submissions.

This trigger uses webhooks to receive real-time notifications when new submissions are received. When enabled, it automatically creates a webhook subscription with Typeform and cleans it up when disabled.

## Actions

### Custom API Call

Make a custom API call to the Typeform API.

**Properties:**

- **Method**: HTTP method to use (GET, POST, PUT, PATCH, DELETE)
- **Path**: Path to append to the base URL (e.g., `/forms`)
- **Query Parameters**: Optional query parameters for the request
- **Body**: Optional request body for POST, PUT, and PATCH requests

This action allows you to access any endpoint in the Typeform API that isn't covered by the built-in triggers and actions.

## Example Usage

### Receiving Form Submissions

1. Authenticate with your Typeform account
2. Add the "New Submission" trigger
3. Select the form you want to monitor
4. Connect the trigger to other actions to process the submission data

### Retrieving Form Details

1. Authenticate with your Typeform account
2. Add the "Custom API Call" action
3. Set Method to "GET"
4. Set Path to "/forms/{form_id}" (replace {form_id} with your form's ID)
5. Execute the action to retrieve detailed information about the form

## API Documentation

For more information about the Typeform API, see the [official documentation](https://developer.typeform.com/create/).
