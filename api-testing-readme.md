# MintFlow API Testing Guide

This guide provides instructions on how to test the MintFlow Admin and Metrics APIs using Postman.

## Files

- `mintflow-api-tests.postman_collection.json`: Postman collection containing all API requests
- `mintflow-api-sequential-tests.postman_collection.json`: Postman collection with tests designed to run in sequence
- `mintflow-api-environment.postman_environment.json`: Postman environment with variables

## Setup Instructions

### 1. Import the Collection and Environment

1. Open Postman
2. Click on "Import" in the top left corner
3. Drag and drop both JSON files or use the file browser to select them
4. Click "Import" to add them to your Postman workspace

### 2. Select the Environment

1. In the top right corner of Postman, click on the environment dropdown
2. Select "MintFlow API Environment"

### 3. Configure Environment Variables

The environment variables will be automatically set during the test sequence:

- `baseUrl`: The base URL of your MintFlow API (default: <http://localhost:7001>)
- `tenantId`: Will be populated after creating a test tenant
- `apiKeyId`: Will be populated after creating an API key
- `apiKeyFullValue`: Will be populated after creating an API key
- `usageId`: Will be populated after creating usage metrics
- `period`: The period for metrics (default: daily)

## Testing Workflow

### Using the Sequential Test Collection

The `mintflow-api-sequential-tests.postman_collection.json` collection is specifically designed to be run in sequence, with each test depending on the results of previous tests:

1. Click on the "Runner" button in Postman
2. Select the MintFlow API Sequential Tests collection
3. Select the MintFlow API Environment
4. **Important**: Make sure to check "Keep variable values" in the runner settings
5. Click "Start Run" to execute all tests in sequence

The sequential collection follows this workflow:

1. **Setup**: Creates a test tenant with a unique identifier
   - Automatically sets the `tenantId` environment variable
   - Sets default values for `baseUrl` and `period` if they don't exist

2. **API Keys**: Tests API key management
   - Creates a test API key and saves its ID to the `apiKeyId` environment variable
   - Gets all API keys and verifies the test key is in the list

3. **Usage Metrics**: Tests usage metrics endpoints
   - Creates test usage metrics and saves the ID to the `usageId` environment variable
   - Gets usage statistics and verifies they match the expected format

Each test automatically:

- Saves necessary IDs to environment variables for subsequent requests
- Includes test scripts to verify the response
- Uses identifiers with "TEST_" prefix for easy identification

This approach allows you to run the entire test suite with a single click and ensures that all tests are run in the correct order with the necessary dependencies.

## Manual Testing

You can also test the endpoints manually:

1. **Create Test Tenant**:
   - Send the "Create Test Tenant" request
   - The `tenantId` environment variable will be automatically set

2. **Create API Key**:
   - Send the "Create Test API Key" request
   - The `apiKeyId` environment variable will be automatically set

3. **Get All API Keys**:
   - Send the "Get All API Keys" request
   - Verify that the created API key is in the list

4. **Create Usage Metrics**:
   - Send the "Create Test Usage Metrics" request
   - The `usageId` environment variable will be automatically set

5. **Get Usage Stats**:
   - Send the "Get Usage Stats" request
   - Verify that the usage statistics are returned correctly

## Troubleshooting

- If you encounter 404 errors, make sure the server is running and the base URL is correct
- If you encounter 401 errors, check that you're using the correct tenant ID
- If you encounter validation errors, check the request body against the API requirements

## Notes

- The API key's full value is only returned when creating a new key
- The test collection automatically sets environment variables, so you don't need to manually copy and paste IDs
- All test data uses the "TEST_" prefix for easy identification and cleanup
