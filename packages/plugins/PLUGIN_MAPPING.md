# MintFlow Plugin Mapping

This document tracks the mapping between reference plugins from `__ref_only` and their corresponding MintFlow implementations.

## Plugin Mapping

### Reference Plugins to MintFlow Plugins

| Reference Plugin | MintFlow Plugin | Status | Notes |
|-----------------|----------------|--------|-------|
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
| typeform | typeform | ✅ Completed | Provides integration with Typeform for form building and data collection. |
| woocommerce | woocommerce | ✅ Completed | Provides integration with WooCommerce for e-commerce platform management including products, orders, customers, and coupons. |
| soap | soap | ✅ Completed | Provides integration with SOAP web services, allowing you to call SOAP methods, parse WSDL files, generate SOAP templates, and create REST-like interfaces for SOAP services. |
| xml | xml | ✅ Completed | Provides utilities for working with XML data, including conversion between XML and JSON, validation, and querying. |

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

- `get_file`: Gets a Figma file
- `get_file_comments`: Gets comments from a Figma file
- `post_file_comment`: Posts a comment to a Figma file
- `get_file_images`: Gets images from a Figma file
- `get_file_nodes`: Gets nodes from a Figma file
- `get_team_projects`: Gets projects from a Figma team
- `get_project_files`: Gets files from a Figma project
- `get_team_components`: Gets components from a Figma team
- `get_file_components`: Gets components from a Figma file
- `get_component_sets`: Gets component sets from a Figma file
- `get_styles`: Gets styles from a Figma file
- `create_webhook`: Creates a webhook for a Figma team
- `delete_webhook`: Deletes a webhook

### salesforce (from salesforce)

The salesforce plugin provides integration with Salesforce CRM for creating, updating, querying, and upserting records.

**Actions:**

- `create_object`: Creates a new record in any Salesforce object (Account, Contact, Lead, etc.)
- `update_object`: Updates an existing record by ID
- `run_query`: Executes Salesforce Object Query Language (SOQL) queries
- `upsert_by_external_id`: Creates or updates records based on an external ID field
- `bulk_upsert`: Efficiently upserts multiple records in a single operation using CSV format

### jira-cloud (from jira-cloud)

The jira-cloud plugin provides integration with Jira Cloud for issue tracking and project management.

**Actions:**

- `create_issue`: Creates a new issue in a Jira project
- `update_issue`: Updates an existing issue
- `get_issue`: Gets details of a specific issue
- `search_issues`: Searches for issues using JQL (Jira Query Language)
- `add_comment`: Adds a comment to an issue
- `update_comment`: Updates an existing comment
- `delete_comment`: Deletes a comment from an issue
- `get_comments`: Gets all comments on an issue
- `assign_issue`: Assigns an issue to a user
- `add_watcher`: Adds a user as a watcher to an issue
- `find_user`: Searches for users in Jira
- `link_issues`: Creates a link between two issues
- `add_attachment`: Adds an attachment to an issue

### mailchimp (from mailchimp)

The mailchimp plugin provides integration with Mailchimp for email marketing and subscriber management.

**Actions:**

- `add_member_to_list`: Adds a new subscriber to a Mailchimp audience (list)
- `update_subscriber_status`: Updates the status of an existing subscriber
- `add_note_to_subscriber`: Adds a note to a subscriber
- `add_subscriber_to_tag`: Adds a tag to a subscriber
- `remove_subscriber_from_tag`: Removes a tag from a subscriber
- `process_webhook`: Processes Mailchimp webhook events

### shopify (from shopify)

The shopify plugin provides integration with Shopify for e-commerce platform management.

**Customer Actions:**

- `get_customer`: Gets a specific customer by ID
- `get_customers`: Gets all customers
- `create_customer`: Creates a new customer
- `update_customer`: Updates an existing customer
- `get_customer_orders`: Gets orders for a specific customer

**Product Actions:**

- `get_product`: Gets a specific product by ID
- `get_products`: Gets all products
- `create_product`: Creates a new product
- `update_product`: Updates an existing product
- `get_product_variant`: Gets a specific product variant
- `upload_product_image`: Uploads an image for a product

**Order Actions:**

- `create_order`: Creates a new order
- `update_order`: Updates an existing order
- `close_order`: Closes an order
- `cancel_order`: Cancels an order
- `create_draft_order`: Creates a draft order

**Transaction Actions:**

- `create_transaction`: Creates a transaction for an order
- `get_transaction`: Gets a specific transaction
- `get_transactions`: Gets all transactions for an order

**Fulfillment Actions:**

- `get_fulfillment`: Gets a specific fulfillment
- `get_fulfillments`: Gets all fulfillments for an order
- `create_fulfillment_event`: Creates a fulfillment event

**Other Actions:**

- `get_locations`: Gets all locations
- `adjust_inventory_level`: Adjusts inventory level for a product variant
- `create_collect`: Adds a product to a collection
- `get_asset`: Gets an asset from a theme
- `process_webhook`: Processes a webhook payload from Shopify

### zendesk (from zendesk)

The zendesk plugin provides integration with Zendesk for customer service and support ticket management.

**Ticket Actions:**

- `get_ticket`: Gets a specific ticket by ID
- `create_ticket`: Creates a new ticket
- `update_ticket`: Updates an existing ticket
- `delete_ticket`: Deletes a ticket
- `add_ticket_comment`: Adds a comment to a ticket
- `search_tickets`: Searches for tickets

**View Actions:**

- `get_views`: Gets all views
- `get_view`: Gets a specific view by ID
- `get_tickets_from_view`: Gets tickets from a specific view

**User Actions:**

- `get_users`: Gets all users
- `get_user`: Gets a specific user by ID

**Group Actions:**

- `get_groups`: Gets all groups
- `get_group`: Gets a specific group by ID

**Organization Actions:**

- `get_organizations`: Gets all organizations
- `get_organization`: Gets a specific organization by ID

**Webhook Actions:**

- `process_webhook`: Processes a webhook payload from Zendesk

### trello (from trello)

The trello plugin provides integration with Trello for project management and task tracking.

**Board Actions:**

- `get_boards`: Gets all boards the authenticated user has access to
- `get_board`: Gets a specific board by ID

**List Actions:**

- `get_board_lists`: Gets all lists in a board
- `create_list`: Creates a new list in a board
- `update_list`: Updates an existing list

**Card Actions:**

- `get_card`: Gets a specific card by ID
- `create_card`: Creates a new card in a list
- `update_card`: Updates an existing card
- `delete_card`: Deletes a card
- `add_comment_to_card`: Adds a comment to a card
- `get_board_cards`: Gets all cards in a board
- `get_list_cards`: Gets all cards in a list

**Label Actions:**

- `get_board_labels`: Gets all labels in a board
- `add_label_to_card`: Adds a label to a card
- `remove_label_from_card`: Removes a label from a card

**Webhook Actions:**

- `create_webhook`: Creates a new webhook
- `delete_webhook`: Deletes a webhook
- `list_webhooks`: Lists all webhooks
- `process_webhook`: Processes a webhook payload

### intercom (from intercom)

The intercom plugin provides integration with Intercom for customer messaging and support.

**Contact Actions:**

- `list_contacts`: Lists all contacts (users and leads)
- `find_contact`: Finds a contact by ID
- `search_contacts`: Searches for contacts
- `create_user`: Creates a new user
- `update_user`: Updates an existing user
- `create_or_update_user`: Creates or updates a user
- `create_or_update_lead`: Creates or updates a lead
- `add_note_to_user`: Adds a note to a user
- `add_tag_to_contact`: Adds a tag to a contact
- `remove_tag_from_contact`: Removes a tag from a contact

**Company Actions:**

- `list_companies`: Lists all companies
- `find_company`: Finds a company by ID
- `search_companies`: Searches for companies
- `add_tag_to_company`: Adds a tag to a company
- `remove_tag_from_company`: Removes a tag from a company

**Conversation Actions:**

- `list_conversations`: Lists all conversations
- `get_conversation`: Gets a specific conversation
- `search_conversations`: Searches for conversations
- `create_conversation`: Creates a new conversation
- `reply_to_conversation`: Replies to a conversation
- `add_note_to_conversation`: Adds a note to a conversation
- `add_tag_to_conversation`: Adds a tag to a conversation
- `remove_tag_from_conversation`: Removes a tag from a conversation

**Message Actions:**

- `send_message`: Sends a message to a contact

**Article Actions:**

- `create_article`: Creates a help center article

**Ticket Actions:**

- `create_ticket`: Creates a support ticket
- `update_ticket`: Updates an existing ticket

**Tag Actions:**

- `list_tags`: Lists all tags

**Admin Actions:**

- `list_admins`: Lists all admins
- `get_admin`: Gets a specific admin

**Webhook Actions:**

- `process_webhook`: Processes a webhook payload

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
