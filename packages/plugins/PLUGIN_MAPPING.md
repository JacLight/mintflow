# MintFlow Plugin Mapping

This document tracks the mapping between reference plugins from `__ref_only` and their corresponding MintFlow implementations.

## Plugin Mapping

### Reference Plugins to MintFlow Plugins

| Reference Plugin | MintFlow Plugin | Status | Notes |
|-----------------|----------------|--------|-------|
| airtable | airtable | ✅ Completed | Provides integration with Airtable for reading, creating, and updating records. |
| approval | authorize | ✅ Completed | Renamed to better reflect its purpose in the MintFlow ecosystem. Provides functionality to create authorization links and pause workflow execution until authorization is received. |
| asana | asana | ✅ Completed | Provides integration with Asana for task management. |
| calendly | calendly | ✅ Completed | Provides integration with Calendly for scheduling and appointment management. |
| csv | csv | ✅ Completed | Provides tools to convert between CSV and JSON formats with support for headers and different delimiters. |
| crypto | crypto | ✅ Completed | Provides cryptographic utilities for hashing text, generating HMAC signatures, and creating random passwords. |
| data-mapper | data-bridge | ✅ Completed | Enhanced with date-helper functionality. Provides tools to transform and map data structures, as well as comprehensive date and time manipulation capabilities. |
| date-helper | data-bridge | ✅ Completed | Merged into data-bridge plugin to provide a unified data transformation experience. |
| delay | delay | ✅ Completed | Provides functionality to delay workflow execution for a specified time. |
| discord | discord | ✅ Completed | Provides integration with Discord for sending messages and managing channels. |
| dropbox | dropbox | ✅ Completed | Provides integration with Dropbox for file management. |
| github | github | ✅ Completed | Provides integration with GitHub for repository management and issue tracking. |
| google-drive | google-drive | ✅ Completed | Provides integration with Google Drive for file management. |
| google-sheets | google-sheets | ✅ Completed | Provides integration with Google Sheets for spreadsheet management. |
| http | fetch | ✅ Completed | Renamed to 'fetch'. Provides functionality to make HTTP requests to external APIs. |
| notion | notion | ✅ Completed | Provides integration with Notion for database and page management. |
| slack | slack | ✅ Completed | Provides integration with Slack for sending messages and managing channels. |
| twilio | twilio | ✅ Completed | Provides integration with Twilio for SMS and voice messaging. |

### MintFlow-Specific Plugins

These plugins are unique to MintFlow and don't have a direct reference plugin counterpart:

| MintFlow Plugin | Description |
|----------------|-------------|
| array | Provides array manipulation functions like map, filter, reduce, and more. |
| exec | Executes shell commands and scripts. |
| inject | Injects data into the workflow context. |
| langchain | Provides integration with LangChain for building LLM applications. |
| llm | Provides integration with various Large Language Models. |
| mail | Provides email sending and receiving capabilities. |
| modify | Modifies data in the workflow context. |
| mqtt | Provides MQTT messaging capabilities for IoT applications. |
| range | Generates ranges of numbers or dates for iteration. |
| start | Initiates workflow execution. |
| switch | Provides conditional branching in workflows. |
| timer | Schedules workflow execution at specific times or intervals. |

## Implementation Details

### airtable (from airtable)

The airtable plugin provides integration with Airtable for reading, creating, and updating records.

**Actions:**

- `list_records`: Retrieves records from an Airtable base
- `get_record`: Retrieves a specific record by ID
- `create_record`: Creates a new record in an Airtable base
- `update_record`: Updates an existing record in an Airtable base
- `delete_record`: Deletes a record from an Airtable base

### authorize (from approval)

The authorize plugin provides functionality to create authorization links and pause workflow execution until authorization is received.

**Actions:**

- `create_authorization_links`: Generates authorization and rejection links
- `wait_for_authorization`: Pauses workflow execution until authorization is received

### csv (from csv)

The csv plugin provides tools to convert between CSV and JSON formats with support for headers and different delimiters.

**Actions:**

- `csv_to_json`: Convert CSV text to a JSON array with support for headers and different delimiters
- `json_to_csv`: Convert a JSON array to CSV text with automatic flattening of nested objects

### crypto (from crypto)

The crypto plugin provides cryptographic utilities for hashing text, generating HMAC signatures, and creating random passwords.

**Actions:**

- `hash_text`: Converts text to a hash value using various hashing algorithms (MD5, SHA1, SHA256, SHA512, SHA3-512)
- `hmac_signature`: Generates an HMAC signature for text using a secret key and various hashing algorithms
- `generate_password`: Creates random passwords with configurable length and character sets

### data-bridge (from data-mapper + date-helper)

The data-bridge plugin provides tools to transform and map data structures, as well as comprehensive date and time manipulation capabilities.

**Data Transformation Actions:**

- `advanced_mapping`: Transform data from one structure to another using a mapping object
- `transform_array`: Apply mapping transformations to each item in an array

**Date and Time Actions:**

- `get_current_date`: Get the current date/time in various formats and timezones
- `format_date`: Convert dates from one format to another
- `extract_date_parts`: Extract components like year, month, day from a date
- `date_difference`: Calculate the difference between two dates
- `add_subtract_date`: Add or subtract time from a date
- `next_day_of_week`: Find the next occurrence of a specific day of the week

### delay (from delay)

The delay plugin provides functionality to delay workflow execution for a specified time.

**Actions:**

- `delay_for`: Delays workflow execution for a specified duration
- `delay_until`: Delays workflow execution until a specified date and time

### discord (from discord)

The discord plugin provides integration with Discord for sending messages and managing channels.

**Actions:**

- `send_message`: Sends a message to a Discord channel
- `send_embed`: Sends an embedded message with rich formatting to a Discord channel
- `create_channel`: Creates a new channel in a Discord server
- `get_messages`: Retrieves messages from a Discord channel

### fetch (from http)

The fetch plugin provides functionality to make HTTP requests to external APIs.

**Actions:**

- `get`: Makes a GET request to a specified URL
- `post`: Makes a POST request to a specified URL
- `put`: Makes a PUT request to a specified URL
- `patch`: Makes a PATCH request to a specified URL
- `delete`: Makes a DELETE request to a specified URL

### github (from github)

The github plugin provides integration with GitHub for repository management and issue tracking.

**Actions:**

- `create_issue`: Creates a new issue in a GitHub repository
- `list_issues`: Lists issues from a GitHub repository
- `create_pull_request`: Creates a new pull request in a GitHub repository
- `list_pull_requests`: Lists pull requests from a GitHub repository
- `get_repository`: Gets information about a GitHub repository

### google-drive (from google-drive)

The google-drive plugin provides integration with Google Drive for file management.

**Actions:**

- `list_files`: Lists files from Google Drive
- `upload_file`: Uploads a file to Google Drive
- `download_file`: Downloads a file from Google Drive
- `create_folder`: Creates a new folder in Google Drive
- `delete_file`: Deletes a file from Google Drive

### google-sheets (from google-sheets)

The google-sheets plugin provides integration with Google Sheets for spreadsheet management.

**Actions:**

- `read_sheet`: Reads data from a Google Sheet
- `append_row`: Appends a row to a Google Sheet
- `update_cell`: Updates a cell in a Google Sheet
- `create_sheet`: Creates a new Google Sheet
- `clear_range`: Clears a range of cells in a Google Sheet

### notion (from notion)

The notion plugin provides integration with Notion for database and page management.

**Actions:**

- `query_database`: Queries a Notion database
- `create_page`: Creates a new page in Notion
- `update_page`: Updates a page in Notion
- `get_page`: Gets information about a Notion page
- `create_database`: Creates a new database in Notion

### slack (from slack)

The slack plugin provides integration with Slack for sending messages and managing channels.

**Actions:**

- `send_message`: Sends a message to a Slack channel
- `send_direct_message`: Sends a direct message to a Slack user
- `create_channel`: Creates a new channel in Slack
- `list_channels`: Lists channels from a Slack workspace
- `upload_file`: Uploads a file to a Slack channel

### twilio (from twilio)

The twilio plugin provides integration with Twilio for SMS and voice messaging.

**Actions:**

- `send_sms`: Sends an SMS message
- `make_call`: Makes a voice call
- `get_message`: Gets information about a message
- `list_messages`: Lists messages from a Twilio account
- `verify_phone_number`: Verifies a phone number

### array (MintFlow-specific)

The array plugin provides array manipulation functions for working with collections of data.

**Actions:**

- `map`: Applies a function to each element in an array
- `filter`: Filters an array based on a condition
- `reduce`: Reduces an array to a single value
- `sort`: Sorts an array based on specified criteria
- `find`: Finds an element in an array based on a condition

### exec (MintFlow-specific)

The exec plugin provides functionality to execute shell commands and scripts.

**Actions:**

- `execute`: Executes a shell command and returns the output
- `execute_script`: Executes a script file and returns the output

### inject (MintFlow-specific)

The inject plugin provides functionality to inject data into the workflow context.

**Actions:**

- `inject_data`: Injects static data into the workflow
- `inject_from_file`: Injects data from a file into the workflow

### switch (MintFlow-specific)

The switch plugin provides conditional branching in workflows.

**Actions:**

- `switch`: Routes workflow execution based on conditions
- `case`: Defines a condition and corresponding action for the switch

## Plugin Creation Process

1. Generate a template using `pnpm generate:template {{plugin-name}}`
2. Implement the plugin based on the reference plugin
3. Create tests and documentation
4. Build and test the plugin

## Naming Conventions

When adapting reference plugins to MintFlow, we follow these naming guidelines:

1. Use clear, descriptive names that reflect the plugin's purpose
2. Prefer shorter names when possible
3. Use kebab-case for plugin directory names
4. Use camelCase for action names
5. When combining functionality from multiple reference plugins, choose a name that encompasses all capabilities

## Plugin Structure

MintFlow plugins follow this structure:

```
packages/plugins/plugin-name/
├── README.md           # Documentation
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
├── src/
│   └── index.ts        # Plugin implementation
└── test/
    └── pluginName.test.ts  # Tests
