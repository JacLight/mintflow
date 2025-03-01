# SurveyMonkey Plugin for MintFlow

The SurveyMonkey plugin for MintFlow provides integration with SurveyMonkey's survey and questionnaire platform, allowing you to automate workflows based on survey responses and interact with the SurveyMonkey API.

## Features

- **Webhook-based Triggers**: Receive real-time notifications for new survey responses
- **Custom API Calls**: Make custom API calls to the SurveyMonkey API for advanced use cases
- **OAuth Authentication**: Secure authentication with SurveyMonkey's OAuth 2.0 API

## Authentication

The SurveyMonkey plugin uses OAuth 2.0 for authentication. You'll need to:

1. Create a SurveyMonkey Developer account at [https://developer.surveymonkey.com/](https://developer.surveymonkey.com/)
2. Create a new app in the SurveyMonkey Developer Portal
3. Configure the OAuth settings with your redirect URI
4. Use the provided access token in your MintFlow workflow

## Triggers

### New Response

Triggers when a new survey response is submitted.

#### Configuration

- **Survey**: The ID of the SurveyMonkey survey to monitor for responses

#### Output

```json
{
  "id": "123456789",
  "survey_id": "987654321",
  "collector_id": "12345",
  "date_created": "2023-03-15T10:30:45+00:00",
  "date_modified": "2023-03-15T10:30:45+00:00",
  "response_status": "completed",
  "custom_variables": {},
  "edit_url": "https://www.surveymonkey.com/r/?sm=abcdefg",
  "analyze_url": "https://www.surveymonkey.com/analyze/browse/abcdefg",
  "ip_address": "192.168.1.1",
  "pages": [
    {
      "id": "page_id",
      "questions": [
        {
          "id": "question_id",
          "answers": [
            {
              "choice_id": "choice_id",
              "text": "Sample answer text"
            }
          ]
        }
      ]
    }
  ]
}
```

## Actions

### Custom API Call

Make a custom API call to the SurveyMonkey API.

#### Input

```json
{
  "method": "GET",
  "path": "surveys",
  "queryParams": {
    "page": 1,
    "per_page": 10
  }
}
```

#### Output

```json
{
  "data": [
    {
      "id": "123456789",
      "title": "Customer Satisfaction Survey",
      "nickname": "",
      "language": "en",
      "folder_id": "0",
      "category": "customer_feedback",
      "question_count": 10,
      "page_count": 2,
      "response_count": 25,
      "date_created": "2023-03-15T10:30:45+00:00",
      "date_modified": "2023-03-15T10:30:45+00:00",
      "buttons_text": {
        "next_button": "Next",
        "prev_button": "Prev",
        "done_button": "Done",
        "exit_button": "Exit"
      },
      "is_owner": true,
      "footer": true,
      "theme_id": "123456",
      "custom_variables": {},
      "href": "https://api.surveymonkey.com/v3/surveys/123456789"
    }
  ],
  "per_page": 10,
  "page": 1,
  "total": 1,
  "links": {
    "self": "https://api.surveymonkey.com/v3/surveys?page=1&per_page=10"
  }
}
```

## Common Use Cases

### Survey Response Processing

- Send email notifications when new survey responses are received
- Store survey responses in a database
- Create tasks in project management tools based on survey responses
- Generate reports from survey data

### Survey Management

- Create and update surveys programmatically
- Retrieve survey responses for reporting
- Export survey data to other systems

## Resources

- [SurveyMonkey API Documentation](https://developer.surveymonkey.com/api/v3/)
- [SurveyMonkey Developer Guide](https://developer.surveymonkey.com/docs/)
- [SurveyMonkey API Reference](https://developer.surveymonkey.com/api/v3/#api-endpoints)
