# MintFlow Plugin Mapping

This document tracks the mapping between reference plugins from `__ref_only` and their corresponding MintFlow implementations.

## Plugin Mapping

### Reference Plugins to MintFlow Plugins

| Reference Plugin | MintFlow Plugin | Status | Notes |
|-----------------|----------------|--------|-------|
| activecampaign | activecampaign | ✅ Completed | Provides integration with ActiveCampaign for contact and account management, tagging, and list subscriptions. |
| convertkit | convertkit | ✅ Completed | Provides integration with ConvertKit for subscriber management, tags, forms, sequences, custom fields, and webhooks. |
| sendgrid | sendgrid | ✅ Completed | Provides integration with SendGrid for sending transactional and marketing emails, including support for dynamic templates. |
| clickup | clickup | ✅ Completed | Provides integration with ClickUp for task management, including creating, retrieving, updating, and deleting tasks. |
| webflow | webflow | ✅ Completed | Provides integration with Webflow for collection item management, including creating, retrieving, updating, and deleting collection items. |
| airtable | airtable | ✅ Completed | Provides integration with Airtable for reading, creating, and updating records. |
| approval | authorize | ✅ Completed | Renamed to better reflect its purpose in the MintFlow ecosystem. Provides functionality to create authorization links and pause workflow execution until authorization is received. |
| asana | asana | ✅ Completed | Provides integration with Asana for task management. |
| salesforce | salesforce | ✅ Completed | Provides integration with Salesforce CRM for creating, updating, querying, and upserting records. |
| jira-cloud | jira-cloud | ✅ Completed | Provides integration with Jira Cloud for issue tracking and project management. |
| mailchimp | mailchimp | ✅ Completed | Provides integration with Mailchimp for email marketing and subscriber management. |
| shopify | shopify | ✅ Completed | Provides integration with Shopify for e-commerce platform management. |
| zendesk | zendesk | ✅ Completed | Provides integration with Zendesk for customer service and support ticket management. |
| trello | trello | ✅ Completed | Provides integration with Trello for project management and task tracking. |
| intercom | intercom | ✅ Completed | Provides integration with Intercom for customer messaging and support. |
| monday | monday | ✅ Completed | Provides integration with Monday.com for workspace, board, and item management. |
| pipedrive | pipedrive | ✅ Completed | Provides integration with Pipedrive CRM for managing persons, organizations, deals, leads, activities, and more. |
| assemblyai | assemblyai | ✅ Completed | Provides advanced speech recognition and audio intelligence capabilities using the AssemblyAI API. |
| apollo | apollo | ✅ Completed | Provides integration with Apollo.io for finding contact information and enriching company data. |
| sendgrid | sendgrid | ✅ Completed | Provides integration with SendGrid for sending transactional and marketing emails. |

### sendgrid (from sendgrid)

The sendgrid plugin provides integration with SendGrid, a cloud-based email delivery service that enables you to send transactional and marketing emails.

**Actions:**

- `send_email`: Sends a text or HTML email to one or more recipients with customizable sender information, subject, and content
- `send_dynamic_template`: Sends an email using a SendGrid dynamic template with template data for personalization
- `custom_api_call`: Makes a custom API call to the SendGrid API for advanced use cases

### apollo (from apollo)

The apollo plugin provides integration with Apollo.io, a sales intelligence and engagement platform for finding contact information and enriching company data.

**Actions:**

- `match_person`: Finds a person's information based on their email address, returning detailed information including name, job title, LinkedIn URL, phone numbers, and organization details
- `enrich_company`: Retrieves detailed information about a company based on its domain, returning comprehensive company data including industry, size, revenue, location, technologies used, and more

Both actions support caching to improve performance and reduce API usage. When `cacheResponse` is set to `true` (the default), the plugin will store the response in the project store for future use.

### activecampaign (from activecampaign)

The activecampaign plugin provides integration with ActiveCampaign for contact and account management, tagging, and list subscriptions.

**Contact Actions:**

- `create_contact`: Creates a new contact in ActiveCampaign
- `update_contact`: Updates an existing contact in ActiveCampaign
- `add_tag_to_contact`: Adds a tag to a contact for better segmentation
- `subscribe_unsubscribe_contact`: Subscribes or unsubscribes a contact from a list
- `add_contact_to_account`: Associates a contact with an account

**Account Actions:**

- `create_account`: Creates a new account in ActiveCampaign
- `update_account`: Updates an existing account in ActiveCampaign

### convertkit (from convertkit)

The convertkit plugin provides integration with ConvertKit, an email marketing platform designed for creators.

**Subscriber Actions:**

- `get_subscriber_by_id`: Gets a subscriber by ID
- `get_subscriber_by_email`: Gets a subscriber by email address
- `list_subscribers`: Lists all subscribers with filtering options
- `update_subscriber`: Updates an existing subscriber
- `unsubscribe_subscriber`: Unsubscribes a subscriber
- `list_tags_by_subscriber_id`: Lists all tags for a subscriber by ID
- `list_tags_by_email`: Lists all tags for a subscriber by email

**Tag Actions:**

- `list_tags`: Lists all tags
- `create_tag`: Creates a new tag
- `tag_subscriber`: Adds a tag to a subscriber
- `remove_tag_from_subscriber_by_email`: Removes a tag from a subscriber by email
- `remove_tag_from_subscriber_by_id`: Removes a tag from a subscriber by ID
- `list_subscriptions_to_tag`: Lists all subscriptions to a tag

**Form Actions:**

- `list_forms`: Lists all forms
- `add_subscriber_to_form`: Adds a subscriber to a form
- `list_form_subscriptions`: Lists all subscriptions to a form

**Sequence Actions:**

- `list_sequences`: Lists all sequences
- `add_subscriber_to_sequence`: Adds a subscriber to a sequence
- `list_subscriptions_to_sequence`: Lists all subscriptions to a sequence

**Custom Field Actions:**

- `list_fields`: Lists all custom fields
- `create_field`: Creates a new custom field
- `update_field`: Updates an existing custom field
- `delete_field`: Deletes a custom field

**Webhook Actions:**

- `create_webhook`: Creates a webhook for various events
- `delete_webhook`: Deletes a webhook

### sendgrid (from sendgrid)

The sendgrid plugin provides integration with SendGrid, an email delivery service for sending transactional and marketing emails.

**Email Actions:**

- `send_email`: Sends a plain text or HTML email to one or more recipients
- `send_dynamic_template`: Sends an email using a SendGrid dynamic template with personalized data

### clickup (from clickup)

The clickup plugin provides integration with ClickUp, an all-in-one productivity platform for tasks, docs, goals, and projects.

**Task Actions:**

- `create_task`: Creates a new task in a ClickUp list
- `get_task`: Gets a task from ClickUp by ID
- `update_task`: Updates an existing task in ClickUp
- `delete_task`: Deletes a task from ClickUp

### monday (from monday)

The monday plugin provides integration with Monday.com for workspace, board, and item management.

**Workspace Actions:**

- `list_workspaces`: Lists all workspaces
- `list_workspace_boards`: Lists all boards in a workspace

**Board Actions:**

- `list_board_groups`: Lists all groups in a board
- `list_board_columns`: Lists all columns in a board
- `list_board_items`: Lists all items in a board
- `create_column`: Creates a new column in a board
- `create_group`: Creates a new group in a board
- `get_board_item_values`: Gets all items with their column values from a board

**Item Actions:**

- `create_item`: Creates a new item in a board
- `update_item`: Updates an existing item in a board
- `update_item_name`: Updates an item's name
- `get_item_column_values`: Gets column values for a specific item
- `create_update`: Creates an update (comment) for an item

**User Actions:**

- `list_users`: Lists all users in the Monday.com account

**Webhook Actions:**

- `create_webhook`: Creates a webhook for a board
- `delete_webhook`: Deletes a webhook

### pipedrive (from pipedrive)

The pipedrive plugin provides integration with Pipedrive CRM, allowing you to manage persons, organizations, deals, leads, activities, and more.

**Person Actions:**

- `list_persons`: Lists all persons
- `get_person`: Gets a specific person by ID
- `create_person`: Creates a new person
- `update_person`: Updates an existing person
- `find_person`: Finds persons by search criteria

**Organization Actions:**

- `list_organizations`: Lists all organizations
- `get_organization`: Gets a specific organization by ID
- `create_organization`: Creates a new organization
- `update_organization`: Updates an existing organization
- `find_organization`: Finds organizations by search criteria

**Deal Actions:**

- `list_deals`: Lists all deals
- `get_deal`: Gets a specific deal by ID
- `create_deal`: Creates a new deal
- `update_deal`: Updates an existing deal
- `find_deal`: Finds deals by search criteria
- `find_deals_associated_with_person`: Finds deals associated with a person

**Lead Actions:**

- `list_leads`: Lists all leads
- `get_lead`: Gets a specific lead by ID
- `create_lead`: Creates a new lead
- `update_lead`: Updates an existing lead

**Activity Actions:**

- `list_activities`: Lists all activities
- `get_activity`: Gets a specific activity by ID
- `create_activity`: Creates a new activity
- `update_activity`: Updates an existing activity
- `find_activity`: Finds activities by search criteria

**Product Actions:**

- `list_products`: Lists all products
- `get_product`: Gets a specific product by ID
- `create_product`: Creates a new product
- `find_product`: Finds products by search criteria
- `add_product_to_deal`: Adds a product to a deal

**Note Actions:**

- `list_notes`: Lists all notes
- `get_note`: Gets a specific note by ID
- `create_note`: Creates a new note
- `find_notes`: Finds notes by search criteria

**User Actions:**

- `list_users`: Lists all users
- `get_user`: Gets a specific user by ID
- `find_user`: Finds users by search criteria

**Follower Actions:**

- `add_follower`: Adds a follower to a deal, person, organization, or lead

**Webhook Actions:**

- `create_webhook`: Creates a webhook
- `delete_webhook`: Deletes a webhook

**Utility Actions:**

- `list_pipelines`: Lists all pipelines
- `list_stages`: Lists all stages
- `list_filters`: Lists all filters of a specific type
- `list_activity_types`: Lists all activity types
- `list_lead_labels`: Lists all lead labels
| calendly | calendly | ✅ Completed | Provides integration with Calendly for scheduling and appointment management. |
| csv | csv | ✅ Completed | Provides tools to convert between CSV and JSON formats with support for headers and different delimiters. |
| crypto | crypto | ✅ Completed | Provides cryptographic utilities for hashing text, generating HMAC signatures, and creating random passwords. |
| data-mapper | data-bridge | ✅ Completed | Enhanced with date-helper functionality. Provides tools to transform and map data structures, as well as comprehensive date and time manipulation capabilities. |
| date-helper | data-bridge | ✅ Completed | Merged into data-bridge plugin to provide a unified data transformation experience. |
| delay | delay | ✅ Completed | Provides functionality to delay workflow execution for a specified time. |
| discord | discord | ✅ Completed | Provides integration with Discord for sending messages and managing channels. |
| dropbox | dropbox | ✅ Completed | Provides integration with Dropbox for file management. |
| facebook-pages | facebook | ✅ Completed | Provides integration with Facebook Pages for creating posts, uploading photos, and uploading videos. |
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
| instagram-business | instagram | ✅ Completed | Provides integration with Instagram Business API for uploading photos and reels. |
| linkedin | linkedin | ✅ Completed | Provides integration with LinkedIn API for creating personal share updates and company page updates. |
| notion | notion | ✅ Completed | Provides integration with Notion for database and page management. |
| slack | slack | ✅ Completed | Provides integration with Slack for sending messages and managing channels. |
| tiktok | tiktok | ✅ Completed | Provides integration with TikTok API for retrieving videos, user details, and uploading content. |
| twilio | twilio | ✅ Completed | Provides integration with Twilio for SMS and voice messaging. |
| youtube | youtube | ✅ Completed | Provides integration with YouTube API for searching videos, retrieving channel information, and managing subscriptions. |
| pinterest | pinterest | ✅ Completed | Provides integration with Pinterest API for creating pins, managing boards, and searching content. |
| snapchat | snapchat | ✅ Completed | Provides integration with Snapchat Marketing API for creating and managing ads, campaigns, and creatives. |
| zoom | zoom | ✅ Completed | Provides integration with Zoom API for creating and managing meetings, handling registrations, and accessing user information. |
| microsoft-teams | teams | ✅ Completed | Provides integration with Microsoft Teams API for creating channels, sending messages, and managing team resources. |
| figma | figma | ✅ Completed | Provides integration with Figma API for accessing and manipulating Figma files, comments, components, and more. |
| wordpress | wordpress | ✅ Completed | Provides integration with WordPress for creating, retrieving, and updating posts and pages, as well as receiving triggers when new content is published. |
| whatsapp | whatsapp | ✅ Completed | Provides integration with WhatsApp Business API for sending text messages, media messages, and template messages. |
| telegram-bot | telegram | ✅ Completed | Provides integration with Telegram Bot API for sending messages, media, creating invite links, and getting chat member information. |
| confluence | confluence | ✅ Completed | Provides integration with Atlassian Confluence for creating, reading, and managing content in Confluence spaces. |

### telegram (from telegram-bot)

The telegram plugin provides integration with the Telegram Bot API, allowing you to send messages, media, create invite links, and get chat member information through your Telegram bot.

**Message Actions:**

- `send_message`: Sends a text message to a Telegram chat
- `send_media`: Sends media (photo, video, sticker, animation) to a Telegram chat
- `create_invite_link`: Creates an invite link for a Telegram chat
- `get_chat_member`: Gets information about a member of a chat

**Trigger:**

- `new_message`: Triggers when a new message is received in a Telegram chat

### confluence (from confluence)

The confluence plugin provides integration with Atlassian Confluence, enabling you to create, read, and manage content in your Confluence spaces.

**Actions:**

- `get_page_content`: Retrieves the content of a Confluence page and optionally all its descendants
- `create_page_from_template`: Creates a new page in Confluence using a template with variable substitution

**Trigger:**

- `new_page`: Triggers when a new page is created in a specified Confluence space

### MintFlow-Specific Plugins

These plugins are unique to MintFlow and don't have a direct reference plugin counterpart:

| MintFlow Plugin | Description |
|----------------|-------------|
| array | Provides array manipulation functions like map, filter, reduce, and more. |
| exec | Executes shell commands and scripts. |
| inject | Injects data into the workflow context. |
| paypal | Provides integration with PayPal API for processing payments, handling refunds, and managing recurring billing. |
| stripe | Provides integration with Stripe API for payment processing, subscription management, and product/price management. |
| langchain | Provides integration with LangChain for building LLM applications. |
| llm | Provides integration with various Large Language Models. |
| mail | Provides email sending and receiving capabilities. |
| modify | Modifies data in the workflow context. |
| mqtt | Provides MQTT messaging capabilities for IoT applications. |
| range | Generates ranges of numbers or dates for iteration. |
| start | Initiates workflow execution. |
| switch | Provides conditional branching in workflows. |
| text-parser | Provides tools for text processing and manipulation including concatenation, find and replace, splitting, Markdown/HTML conversion, HTML stripping, slugify, and default values. |
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

### facebook (from facebook-pages)

The facebook plugin provides integration with Facebook Pages API for creating posts and uploading media.

**Actions:**

- `create_post`: Creates a text post on a Facebook Page
- `create_photo_post`: Uploads and posts a photo to a Facebook Page
- `create_video_post`: Uploads and posts a video to a Facebook Page
- `get_pages`: Retrieves a list of Facebook Pages the user manages

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

### instagram (from instagram-business)

The instagram plugin provides integration with Instagram Business API for uploading photos and reels.

**Actions:**

- `get_accounts`: Retrieves a list of Instagram Business accounts the user manages
- `upload_photo`: Uploads and posts a photo to an Instagram Business account
- `upload_reel`: Uploads and posts a reel (video) to an Instagram Business account

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

### tiktok (from tiktok)

The tiktok plugin provides integration with TikTok API for retrieving videos, user details, and uploading content.

**Actions:**

- `get_user_videos`: Retrieves videos from a TikTok user's account
- `get_video_details`: Gets detailed information about a specific TikTok video
- `get_user_details`: Gets profile information about a TikTok user
- `upload_video`: Uploads a video to TikTok

### twilio (from twilio)

The twilio plugin provides integration with Twilio for SMS and voice messaging.

**Actions:**

- `send_sms`: Sends an SMS message
- `make_call`: Makes a voice call
- `get_message`: Gets information about a message
- `list_messages`: Lists messages from a Twilio account
- `verify_phone_number`: Verifies a phone number

### youtube (from youtube)

The youtube plugin provides integration with YouTube API for searching videos, retrieving channel information, and managing subscriptions.

**Actions:**

- `search_videos`: Searches for videos on YouTube
- `get_channel_videos`: Gets videos from a specific YouTube channel
- `get_video_details`: Gets detailed information about a specific YouTube video
- `get_channel_details`: Gets information about a YouTube channel by ID or username
- `subscribe_to_channel`: Subscribes to a YouTube channel
- `check_subscription`: Checks if the authenticated user is subscribed to a channel

### pinterest (from pinterest)

The pinterest plugin provides integration with Pinterest API for creating pins, managing boards, and searching content.

**Actions:**

- `create_pin`: Creates a pin on a Pinterest board
- `create_board`: Creates a new board on Pinterest
- `get_board_pins`: Gets pins from a specific Pinterest board
- `get_user_boards`: Gets boards from a user's Pinterest account
- `get_user_profile`: Gets profile information about a Pinterest user
- `search_pins`: Searches for pins on Pinterest

### snapchat (from snapchat)

The snapchat plugin provides integration with Snapchat Marketing API for creating and managing ads, campaigns, and creatives.

**Actions:**

- `create_ad`: Creates an ad on Snapchat
- `create_campaign`: Creates an advertising campaign on Snapchat
- `create_creative`: Creates an ad creative on Snapchat
- `get_ads`: Gets ads from a Snapchat ad account
- `get_campaigns`: Gets campaigns from a Snapchat ad account
- `get_ad_accounts`: Gets ad accounts from Snapchat

### stripe (MintFlow-specific)

The stripe plugin provides integration with Stripe API for payment processing, subscription management, and product/price management.

**Actions:**

- `create_customer`: Creates a customer in Stripe
- `create_payment_intent`: Creates a payment intent for one-time payments
- `create_subscription`: Creates a subscription for recurring payments
- `create_product`: Creates a product in Stripe
- `create_price`: Creates a price for a product in Stripe
- `get_customer`: Gets customer details from Stripe
- `get_payment_intent`: Gets payment intent details from Stripe
- `get_subscription`: Gets subscription details from Stripe
- `get_product`: Gets product details from Stripe
- `get_price`: Gets price details from Stripe
- `list_customers`: Lists customers from Stripe
- `list_payment_intents`: Lists payment intents from Stripe
- `list_subscriptions`: Lists subscriptions from Stripe
- `list_products`: Lists products from Stripe
- `list_prices`: Lists prices from Stripe

### paypal (MintFlow-specific)

The paypal plugin provides integration with PayPal API for processing payments, handling refunds, and managing recurring billing.

**Actions:**

- `create_payment`: Creates a payment in PayPal
- `execute_payment`: Executes a payment after payer approval
- `get_payment`: Gets payment details from PayPal
- `refund_sale`: Refunds a sale in PayPal
- `create_billing_plan`: Creates a billing plan for subscriptions
- `activate_billing_plan`: Activates a billing plan
- `get_billing_plan`: Gets billing plan details from PayPal
- `create_billing_agreement`: Creates a billing agreement for subscriptions
- `execute_billing_agreement`: Executes a billing agreement after payer approval
- `get_billing_agreement`: Gets billing agreement details from PayPal
- `cancel_billing_agreement`: Cancels a billing agreement
- `list_payments`: Lists payments from PayPal
- `list_billing_plans`: Lists billing plans from PayPal

### zoom (from zoom)

The zoom plugin provides integration with Zoom API for creating and managing meetings, handling registrations, and accessing user information.

**Actions:**

- `create_meeting`: Creates a new meeting in Zoom
- `get_meeting`: Gets details about a specific meeting
- `update_meeting`: Updates an existing meeting
- `delete_meeting`: Deletes a meeting
- `list_meetings`: Lists meetings for a user
- `create_meeting_registrant`: Registers a participant for a meeting
- `list_meeting_registrants`: Lists registrants for a meeting
- `get_user`: Gets information about a Zoom user
- `list_users`: Lists users in a Zoom account

### teams (from microsoft-teams)

The teams plugin provides integration with Microsoft Teams API for creating channels, sending messages, and managing team resources.

**Actions:**

- `create_channel`: Creates a new channel in a team
- `send_channel_message`: Sends a message to a channel
- `send_chat_message`: Sends a message to a chat
- `list_teams`: Lists teams the user is a member of
- `list_channels`: Lists channels in a team
- `list_chats`: Lists chats the user is a member of
- `get_team`: Gets details about a team
- `get_channel`: Gets details about a channel
- `get_chat`: Gets details about a chat
- `list_channel_messages`: Lists messages in a channel
- `list_chat_messages`: Lists messages in a chat

### figma (from figma)

The figma plugin provides integration with Figma API for accessing and manipulating Figma files, comments, components, and more.

**Actions:**

-

### whatsapp (from whatsapp)

The whatsapp plugin provides integration with WhatsApp Business API for sending messages, media, and templates through WhatsApp.

**Message Actions:**

- `send_message`: Sends a text message to a WhatsApp user
- `send_media`: Sends a media message (image, audio, document, sticker, or video) to a WhatsApp user
- `send_template`: Sends a template message to a WhatsApp user using pre-approved templates

### wordpress (from wordpress)

The wordpress plugin provides integration with WordPress, the world's most popular content management system, for creating, retrieving, and updating posts and pages.

**Post Actions:**

- `create_post`: Creates a new post on WordPress with support for custom fields, featured media, and more
- `get_post`: Retrieves a post from WordPress by ID
- `update_post`: Updates an existing post on WordPress

**Page Actions:**

- `create_page`: Creates a new page on WordPress with support for hierarchical structure

**Triggers:**

- `new_post`: Triggers when a new post is published on WordPress
