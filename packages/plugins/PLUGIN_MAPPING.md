# MintFlow Plugin Mapping

This document tracks the mapping between reference plugins from `__ref_only` and their corresponding MintFlow implementations.

## Plugin Mapping

### Reference Plugins to MintFlow Plugins

| Reference Plugin | MintFlow Plugin | Status | Notes |
|-----------------|----------------|--------|-------|
| airtable | airtable | ✅ Completed | Provides integration with Airtable for reading, creating, and updating records. |
| approval | authorize | ✅ Completed | Renamed to better reflect its purpose in the MintFlow ecosystem. Provides functionality to create authorization links and pause workflow execution until authorization is received. |
| asana | asana | ✅ Completed | Provides integration with Asana for task management. |
| assemblyai | assemblyai | ✅ Completed | Provides advanced speech recognition and audio intelligence capabilities using AssemblyAI. |
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
| mysql | mysql | ✅ Completed | Provides integration with MySQL databases for executing queries and managing data. |
| postgres | postgres | ✅ Completed | Provides integration with PostgreSQL databases for executing queries and managing data. |
| qdrant | qdrant | ✅ Completed | Provides integration with Qdrant vector database for similarity search and vector operations. |
| queue | queue | ✅ Completed | Provides a First-In-First-Out (FIFO) queue system for managing data flow and processing order in workflows. |
| redis | redis | ✅ Completed | Provides integration with Redis databases for caching, pub/sub messaging, and data storage. |
| pinecone | pinecone | ✅ Completed | Provides integration with Pinecone vector database for similarity search and vector operations. |
| supabase | supabase | ✅ Completed | Provides integration with Supabase for database operations and storage management. |
| notion | notion | ✅ Completed | Provides integration with Notion for database and page management. |
| slack | slack | ✅ Completed | Provides integration with Slack for sending messages and managing channels. |
| twilio | twilio | ✅ Completed | Provides integration with Twilio for SMS and voice messaging. |
| google-calendar, google-contacts, google-docs, google-forms, google-tasks | google-workspace | ✅ Completed | Consolidated multiple Google services into a single plugin. Provides integration with Google Calendar for event management and Google Contacts for contact management. |
| google-search-console | google-search | ✅ Completed | Provides integration with Google Search Console for website search performance analysis and management. |
| google-my-business | google-business | ✅ Completed | Provides integration with Google My Business (now Google Business Profile) for managing business listings, locations, and reviews. |
| http | fetch | ✅ Completed | Renamed to 'fetch'. Provides functionality to make HTTP requests to external APIs. |
| hubspot | hubspot | ✅ Completed | Provides integration with HubSpot for contact management and CRM operations. |
| json | json | ✅ Completed | Provides utilities for converting between JSON and text formats. |
| linkedin | linkedin | ✅ Completed | Provides integration with LinkedIn for creating personal and company updates. |
| notion | notion | ✅ Completed | Provides integration with Notion for database and page management. |
| pdf | pdf | ✅ Completed | Provides utilities for working with PDF documents - extract text, convert text to PDF, and convert images to PDF. |
| qrcode | media-processor | ✅ Completed | Consolidated into the media-processor plugin. Provides functionality to generate QR codes from text or URLs with customizable settings. |
| amazon-s3 | s3-storage | ✅ Completed | Renamed to 's3-storage' to reflect its compatibility with any S3-compatible storage service, not just AWS. Provides functionality to upload, read, and list files in S3 buckets. |
| amazon-sns | sns | ✅ Completed | Provides integration with Amazon SNS for sending messages to topics and managing SNS resources. |
| amazon-sqs | sqs | ✅ Completed | Provides integration with Amazon SQS for sending messages to queues and managing SQS resources. |
| slack | slack | ✅ Completed | Provides integration with Slack for sending messages and managing channels. |
| twilio | twilio | ✅ Completed | Provides integration with Twilio for SMS and voice messaging. |
| webhook | webhook | ✅ Completed | Provides functionality to receive and respond to HTTP webhooks with support for various authentication methods. |

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
| ai | Provides integration with various AI models including text generation, chat, embeddings, and image analysis. Supports multiple providers including OpenAI, Anthropic, Google (Gemini), and Ollama with automatic fallback. |
| mail | Provides email sending and receiving capabilities. |
| media-processor | Comprehensive plugin for processing various types of media including QR codes, barcodes, images, OCR, and AI image analysis. |
| modify | Modifies data in the workflow context. |
| mqtt | Provides MQTT messaging capabilities for IoT applications. |
| range | Generates ranges of numbers or dates for iteration. |
| start | Initiates workflow execution. |
| switch | Provides conditional branching in workflows. |
| timer | Schedules workflow execution at specific times or intervals. |
| queue | Provides a robust queue system powered by Bull and Redis for managing data flow, processing order, and job scheduling in workflows. |

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

### google-workspace (from google-calendar, google-contacts, google-docs, google-forms, google-tasks)

The google-workspace plugin provides integration with multiple Google Workspace services in a single plugin.

**Calendar Actions:**

- `create_calendar_event`: Creates a new event in Google Calendar
- `get_calendar_events`: Retrieves events from a Google Calendar with filtering options
- `update_calendar_event`: Updates an existing event in Google Calendar
- `delete_calendar_event`: Deletes an event from Google Calendar
- `add_calendar_attendees`: Adds attendees to an existing Google Calendar event

**Contacts Actions:**

- `create_contact`: Creates a new contact in Google Contacts with detailed information

### google-search (from google-search-console)

The google-search plugin provides integration with Google Search Console for website search performance analysis and management.

**Actions:**

- `search_analytics`: Query traffic data for your site using the Google Search Console API
- `list_sites`: Retrieve a list of sites you have access to in Google Search Console
- `url_inspection`: Check the indexing status and other details of a specific URL
- `list_sitemaps`: Get information about all sitemaps submitted for a site
- `submit_sitemap`: Submit a new sitemap to Google Search Console

### google-business (from google-my-business)

The google-business plugin provides integration with Google My Business (now Google Business Profile) for managing business listings, locations, and reviews.

**Actions:**

- `create_reply`: Create or update a reply to a customer review
- `list_accounts`: Retrieve a list of all Google My Business accounts you have access to
- `list_locations`: Get information about all locations associated with a specific account
- `list_reviews`: Retrieve customer reviews for a specific location

### hubspot (from hubspot)

The hubspot plugin provides integration with HubSpot for contact management and CRM operations.

**Actions:**

- `createContact`: Creates a new contact in HubSpot with customizable properties
- `getContact`: Retrieves a contact by ID with all its properties
- `updateContact`: Updates an existing contact's properties
- `findContact`: Searches for contacts using queries and filters

### json (from json)

The json plugin provides utilities for converting between JSON and text formats.

**Actions:**

- `convert_text_to_json`: Converts a text string containing JSON to a JSON object
- `convert_json_to_text`: Converts a JSON object to a text string with optional pretty printing

### mysql (from mysql)

The mysql plugin provides integration with MySQL databases for executing queries and managing data.

**Actions:**

- `executeQuery`: Executes a custom SQL query on the MySQL database
- `getTables`: Gets a list of all tables in the database
- `selectRows`: Selects rows from a table with optional filtering, sorting, and pagination
- `insertRow`: Inserts a new row into a table
- `updateRows`: Updates rows in a table that match specified conditions
- `deleteRows`: Deletes rows from a table that match specified conditions

### postgres (from postgres)

The postgres plugin provides integration with PostgreSQL databases for executing queries and managing data.

**Actions:**

- `executeQuery`: Executes a custom SQL query on the PostgreSQL database
- `getTables`: Gets a list of all tables in a database schema
- `selectRows`: Selects rows from a table with optional filtering, sorting, and pagination
- `insertRow`: Inserts a new row into a table with support for returning generated values
- `updateRows`: Updates rows in a table that match specified conditions
- `deleteRows`: Deletes rows from a table that match specified conditions

### redis (from redis)

The redis plugin provides integration with Redis databases for caching, pub/sub messaging, and data storage.

**Actions:**

- `set`: Sets a key-value pair in Redis with optional expiration
- `get`: Gets the value of a key from Redis
- `delete`: Deletes a key from Redis
- `exists`: Checks if a key exists in Redis
- `expire`: Sets an expiration time for a key
- `ttl`: Gets the remaining time to live of a key
- `incr`: Increments the integer value of a key by one
- `incrBy`: Increments the integer value of a key by the given amount
- `decr`: Decrements the integer value of a key by one
- `decrBy`: Decrements the integer value of a key by the given amount
- `hSet`: Sets a field in a hash stored at key to value
- `hGet`: Gets the value of a field in a hash
- `hGetAll`: Gets all fields and values in a hash
- `hDel`: Deletes a field from a hash
- `publish`: Publishes a message to a channel
- `lPush`: Prepends one or multiple values to a list
- `rPush`: Appends one or multiple values to a list
- `lPop`: Removes and gets the first element in a list
- `rPop`: Removes and gets the last element in a list
- `lRange`: Gets a range of elements from a list
- `executeCommand`: Executes a custom Redis command

### pinecone (from pinecone)

The pinecone plugin provides integration with Pinecone vector database for similarity search and vector operations.

**Actions:**

- `listIndexes`: Lists all indexes in your Pinecone project
- `describeIndex`: Gets details about a specific index
- `createIndex`: Creates a new vector index
- `deleteIndex`: Deletes a vector index
- `upsertVectors`: Inserts or updates vectors in an index
- `queryVectors`: Queries vectors in an index for similarity search
- `deleteVectors`: Deletes vectors from an index
- `fetchVectors`: Fetches vectors by ID from an index
- `updateVector`: Updates a vector in an index
- `describeIndexStats`: Gets statistics about an index

### qdrant (from qdrant)

The qdrant plugin provides integration with Qdrant vector database for similarity search and vector operations.

**Actions:**

- `listCollections`: Lists all collections in your Qdrant instance
- `getCollectionInfo`: Gets detailed information about a specific collection
- `createCollection`: Creates a new vector collection
- `deleteCollection`: Deletes a vector collection
- `addPoints`: Adds vector points to a collection
- `searchPoints`: Searches for points closest to a given vector
- `getPoints`: Retrieves points by their IDs
- `deletePoints`: Deletes points from a collection
- `getCollectionStats`: Gets statistics about a collection

### queue (from queue)

The queue plugin provides a robust queue system powered by Bull and Redis for managing data flow, processing order, and job scheduling in workflows.

**Actions:**

- `addJob`: Adds a job to a queue with optional scheduling and processing options
- `getJob`: Gets information about a specific job by ID
- `getJobs`: Gets jobs from a queue with filtering options
- `removeJob`: Removes a job from a queue
- `clearQueue`: Removes all jobs from a queue
- `pauseQueue`: Pauses a queue (stops processing new jobs)
- `resumeQueue`: Resumes a paused queue
- `getQueueInfo`: Gets information about a queue including job counts
- `registerProcessor`: Registers a processor function for a queue to process jobs
- `subscribeToEvents`: Subscribes to queue events and executes a callback function when they occur
- `createBatchJobs`: Adds multiple jobs to a queue in a single operation

### supabase (from supabase)

The supabase plugin provides integration with Supabase for database operations and storage management.

**Actions:**

- `uploadFile`: Uploads a file to Supabase Storage
- `downloadFile`: Downloads a file from Supabase Storage
- `listFiles`: Lists files in a Supabase Storage bucket
- `deleteFile`: Deletes a file from Supabase Storage
- `executeQuery`: Executes a query on a Supabase database table
- `insertRecord`: Inserts a new record into a Supabase table
- `updateRecord`: Updates records in a Supabase table
- `deleteRecord`: Deletes records from a Supabase table
- `createBucket`: Creates a new storage bucket in Supabase

### notion (from notion)

The notion plugin provides integration with Notion for database and page management.

**Actions:**

- `query_database`: Queries a Notion database
- `create_page`: Creates a new page in Notion
- `update_page`: Updates a page in Notion
- `get_page`: Gets information about a Notion page
- `create_database`: Creates a new database in Notion

### pdf (from pdf)

The pdf plugin provides utilities for working with PDF documents.

**Actions:**

- `extract_text`: Extracts text from a PDF file
- `text_to_pdf`: Converts text to a PDF document with customizable formatting
- `image_to_pdf`: Converts PNG or JPEG images to PDF documents

### qrcode (from qrcode)

The qrcode plugin provides functionality to generate QR codes from text or URLs.

**Actions:**

- `text_to_qrcode`: Converts text or URLs to QR codes with customizable settings including output format, error correction level, margin, scale, width, and colors

### s3-storage (from amazon-s3)

The s3-storage plugin provides integration with Amazon S3 and S3-compatible storage services for file management.

**Actions:**

- `upload_file`: Uploads a file to an S3 bucket with customizable settings
- `read_file`: Retrieves a file from an S3 bucket
- `list_files`: Lists files in an S3 bucket with optional filtering

### sns (from amazon-sns)

The sns plugin provides integration with Amazon SNS for sending messages to topics and managing SNS resources.

**Actions:**

- `send_message`: Sends a message to an Amazon SNS topic
- `list_topics`: Lists available SNS topics in your AWS account
- `create_topic`: Creates a new SNS topic

### sqs (from amazon-sqs)

The sqs plugin provides integration with Amazon SQS for sending messages to queues and managing SQS resources.

**Actions:**

- `send_message`: Sends a message to an Amazon SQS queue
- `list_queues`: Lists available SQS queues in your AWS account
- `create_queue`: Creates a new SQS queue with customizable settings

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

### webhook (from webhook)

The webhook plugin provides functionality to receive and respond to HTTP webhooks in your MintFlow workflows.

**Actions:**

- `returnResponse`: Returns a customized HTTP response with control over status codes, headers, and body content
- `catchHook`: Receives incoming HTTP requests with support for various authentication methods including None, Basic Auth, and Header Auth

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

### ai (MintFlow-specific)

The ai plugin provides integration with various AI models for text generation, chat, embeddings, and image analysis. It supports multiple providers including OpenAI, Anthropic, Google (Gemini), and Ollama with automatic fallback.

**Text Generation Actions:**

- `generateText`: Generates text using an AI model with support for system prompts and various parameters
- `streamText`: Generates text with streaming for real-time updates

**Chat Actions:**

- `chat`: Has conversations with AI models with support for conversation history
- `chatStream`: Has conversations with streaming for real-time responses

**Embedding Actions:**

- `generateEmbedding`: Generates vector embeddings for text or arrays of text

**Image Analysis Actions:**

- `analyzeImage`: Analyzes images and generates descriptions using vision-capable models

**Model Management Actions:**

- `listModels`: Lists available models from providers with optional filtering by capability
- `validateModel`: Checks if a model is valid for a provider

**Advanced Actions:**

- `passthrough`: Provides direct access to provider-specific APIs without any processing, allowing for advanced use cases

### speech (MintFlow-specific)

The speech plugin provides integration with various speech-related AI services, enabling text-to-speech and speech-to-text functionality in your workflows.

**Text-to-Speech Actions:**

- `textToSpeech`: Converts text to natural-sounding speech using multiple providers (ElevenLabs, OpenAI, Microsoft Azure, Google Cloud)
- `getVoices`: Lists available voices from any supported provider with optional language filtering

**Speech-to-Text Actions:**

- `speechToText`: Transcribes audio files to text using AssemblyAI with support for speaker identification, sentiment analysis, entity detection, and more
- `getTranscriptionStatus`: Checks the status of an ongoing transcription

### assemblyai (from assemblyai)

The assemblyai plugin provides advanced speech recognition and audio intelligence capabilities using the AssemblyAI API.

**Transcription Actions:**

- `transcribe`: Transcribes audio files to text with support for speaker diarization, sentiment analysis, entity detection, and more
- `getTranscriptStatus`: Checks the status of an ongoing transcription

**AI Analysis Actions:**

- `lemurTask`: Analyzes transcripts with LeMUR (Language Model for Understanding and Reasoning) to extract insights, summaries, and more

### translation (MintFlow-specific)

The translation plugin provides integration with various translation services, enabling text translation and language detection in your workflows.

**Translation Actions:**

- `translateText`: Translates text between languages using DeepL or Google Translate with support for advanced options like formatting, formality, and tag handling
- `detectLanguage`: Detects the language of a text using Google Translate

### media-processor (MintFlow-specific)

The media-processor plugin provides comprehensive media processing capabilities including QR codes, barcodes, images, OCR, AI analysis, watermarking, compression, and metadata extraction.

**QR Code Actions:**

- `text_to_qrcode`: Converts text or URLs to QR codes with customizable settings including output format, error correction level, margin, scale, width, and colors

**Barcode Actions:**

- `text_to_barcode`: Converts text to various barcode formats (CODE128, EAN13, EAN8, UPC, CODE39, ITF14) with customizable settings including width, height, colors, and display options

**Image Processing Actions:**

- `resize_image`: Resizes images to specified dimensions with customizable settings for fit, position, output format, and quality
- `apply_filter`: Applies filters to images including grayscale, sepia, blur, sharpen, negative, brightness, and contrast
- `convert_format`: Converts images between different formats including JPEG, PNG, WebP, AVIF, TIFF, and GIF

**OCR Actions:**

- `extract_text`: Extracts text from images with support for multiple languages, different OCR engines, and page segmentation modes

**AI Image Analysis Actions:**

- `analyze_image`: Analyzes images using AI to detect objects, faces, labels, text, perform content moderation, and identify dominant colors

**Watermarking Actions:**

- `add_watermark`: Adds text or image watermarks to images with customizable position, opacity, rotation, scale, and font settings

**Image Compression Actions:**

- `compress_image`: Compresses images to reduce file size while maintaining acceptable quality with options for quality, format, dimensions, progressive encoding, and metadata preservation

**Metadata Extraction Actions:**

- `extract_metadata`: Extracts metadata from images including EXIF (camera, exposure, GPS), IPTC (title, keywords, copyright), XMP (creator, dates), and ICC profile data

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
