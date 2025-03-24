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
| klaviyo | klaviyo | ✅ Completed | Provides integration with Klaviyo for email marketing and customer data platform, including tracking events, identifying profiles, managing lists, and accessing campaign data. |

### klaviyo (from klaviyo)

The klaviyo plugin provides integration with Klaviyo, a powerful email marketing and customer data platform.

**Actions:**

- `track_event`: Tracks an event in Klaviyo, associating it with a customer profile
- `identify_profile`: Creates or updates a profile in Klaviyo
- `get_lists`: Retrieves all lists from your Klaviyo account
- `add_profiles_to_list`: Adds one or more profiles to a Klaviyo list
- `remove_profile_from_list`: Removes a profile from a Klaviyo list
- `get_campaigns`: Retrieves all campaigns from your Klaviyo account

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
| microsoft-excel-365 | microsoft-office | ✅ Completed | Integrated into the Microsoft Office plugin. Provides integration with Excel for workbook management, worksheet operations, and data manipulation. |
| microsoft-onedrive | microsoft-office | ✅ Completed | Integrated into the Microsoft Office plugin. Provides file storage and management capabilities for Office documents. |
| microsoft-outlook-calendar | microsoft-office | ✅ Completed | Integrated into the Microsoft Office plugin. Provides calendar management capabilities. |
| microsoft-sharepoint | microsoft-office | ✅ Completed | Integrated into the Microsoft Office plugin. Provides document management and collaboration capabilities. |
| microsoft-dynamics-crm | microsoft-office | ✅ Completed | Integrated into the Microsoft Office plugin. Provides customer relationship management capabilities. |
| figma | figma | ✅ Completed | Provides integration with Figma API for accessing and manipulating Figma files, comments, components, and more. |
| wordpress | wordpress | ✅ Completed | Provides integration with WordPress for creating, retrieving, and updating posts and pages, as well as receiving triggers when new content is published. |
| whatsapp | whatsapp | ✅ Completed | Provides integration with WhatsApp Business API for sending text messages, media messages, and template messages. |
| telegram-bot | telegram | ✅ Completed | Provides integration with Telegram Bot API for sending messages, media, creating invite links, and getting chat member information. |
| confluence | confluence | ✅ Completed | Provides integration with Atlassian Confluence for creating, reading, and managing content in Confluence spaces. |
| mattermost | mattermost | ✅ Completed | Provides integration with Mattermost for sending messages and making custom API calls to the Mattermost API. |

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

### mattermost (from mattermost)

The mattermost plugin provides integration with Mattermost, an open-source, self-hosted messaging platform for team communication.

**Actions:**

- `send_message`: Sends a text message to a Mattermost channel
- `custom_api_call`: Makes a custom API call to the Mattermost API for advanced use cases

### square (from square)

The square plugin provides integration with Square's payment processing and point of sale platform, allowing you to automate workflows based on Square events.

**Triggers:**

- `new_order`: Triggered when a new order is created in Square
- `order_updated`: Triggered when an existing order is updated in Square
- `new_customer`: Triggered when a new customer is created in Square
- `customer_updated`: Triggered when an existing customer is updated in Square
- `new_payment`: Triggered when a new payment is created in Square
- `new_invoice`: Triggered when a new invoice is created in Square
- `new_appointment`: Triggered when a new appointment is created in Square

### razorpay (from razorpay)

The razorpay plugin provides integration with Razorpay's payment gateway, allowing you to create payment links and interact with the Razorpay API.

**Actions:**

- `create_payment_link`: Creates a payment link that can be shared with customers
- `custom_api_call`: Makes a custom API call to the Razorpay API for advanced use cases

### jotform (from jotform)

The jotform plugin provides integration with JotForm's online form and survey platform, allowing you to automate workflows based on form submissions and interact with the JotForm API.

**Triggers:**

- `new_submission`: Triggers when a new form submission is received

**Actions:**

- `custom_api_call`: Makes a custom API call to the JotForm API for advanced use cases

### surveymonkey (from surveymonkey)

The surveymonkey plugin provides integration with SurveyMonkey's survey and questionnaire platform, allowing you to automate workflows based on survey responses and interact with the SurveyMonkey API.

**Triggers:**

- `new_response`: Triggers when a new survey response is submitted

**Actions:**

- `custom_api_call`: Makes a custom API call to the SurveyMonkey API for advanced use cases

### tally (from tally)

The tally plugin provides integration with Tally's form creation platform, allowing you to automate workflows based on form submissions.

**Triggers:**

- `new_submission`: Triggers when a new form submission is received

### perplexity-ai (from perplexity-ai)

The perplexity-ai plugin provides integration with Perplexity's AI-powered search engine, allowing you to generate text completions and answers to questions with citations.

**Actions:**

- `ask_ai`: Enables users to generate prompt completion based on a specified model

### groq (from groq)

The groq plugin provides integration with Groq's high-performance AI inference platform, allowing you to generate text completions and process audio with Groq's fast language models.

**Actions:**

- `ask_ai`: Generate text completions and answers to questions using Groq's language models
- `transcribe_audio`: Transcribe audio into text in the input language
- `translate_audio`: Translate audio into English text
- `custom_api_call`: Make a custom API call to the Groq API

### quickbooks (from quickbooks)

The quickbooks plugin provides integration with Intuit's QuickBooks Online accounting software, allowing you to automate accounting tasks, retrieve financial data, and create invoices and other financial documents.

**Actions:**

- `get_customer`: Retrieve a customer from QuickBooks by ID
- `create_invoice`: Create a new invoice in QuickBooks
- `get_profit_loss_report`: Generate a profit and loss report from QuickBooks
- `custom_api_call`: Make a custom API call to the QuickBooks API

**Triggers:**

- `new_invoice`: Triggers when a new invoice is created in QuickBooks

### xero (from xero)

The xero plugin provides integration with Xero's cloud-based accounting software, allowing you to automate accounting tasks, retrieve financial data, and create invoices and other financial documents.

**Actions:**

- `get_contact`: Retrieve a contact from Xero by ID
- `create_invoice`: Create a new invoice in Xero
- `get_profit_loss_report`: Generate a profit and loss report from Xero
- `custom_api_call`: Make a custom API call to the Xero API

**Triggers:**

- `new_invoice`: Triggers when a new invoice is created in Xero

### invoiceninja (from invoiceninja)

The invoiceninja plugin provides integration with InvoiceNinja's open-source invoicing, billing, and accounting platform, allowing you to automate client management, invoice creation, and payment tracking.

**Actions:**

- `get_client`: Retrieve a client from InvoiceNinja by ID
- `create_invoice`: Create a new invoice in InvoiceNinja
- `get_payment`: Retrieve a payment from InvoiceNinja by ID
- `custom_api_call`: Make a custom API call to the InvoiceNinja API

**Triggers:**

- `new_invoice`: Triggers when a new invoice is created in InvoiceNinja
- `new_payment`: Triggers when a new payment is created in InvoiceNinja

### freshbooks (from freshbooks)

The freshbooks plugin provides integration with Freshbooks' cloud-based accounting software, allowing you to automate client management, invoice creation, expense tracking, and time tracking.

**Actions:**

- `get_client`: Retrieve a client from Freshbooks by ID
- `create_invoice`: Create a new invoice in Freshbooks
- `get_expense`: Retrieve an expense from Freshbooks by ID
- `get_time_entry`: Retrieve a time entry from Freshbooks by ID
- `custom_api_call`: Make a custom API call to the Freshbooks API

**Triggers:**

- `new_invoice`: Triggers when a new invoice is created in Freshbooks
- `new_expense`: Triggers when a new expense is created in Freshbooks

### freshdesk (from freshdesk)

The freshdesk plugin provides integration with Freshdesk's customer support and helpdesk platform, allowing you to automate ticket management, contact management, and more.

**Actions:**

- `get_ticket`: Retrieve a ticket from Freshdesk by ID
- `create_ticket`: Create a new ticket in Freshdesk
- `get_contact`: Retrieve a contact from Freshdesk by ID
- `custom_api_call`: Make a custom API call to the Freshdesk API

**Triggers:**

- `new_ticket`: Triggers when a new ticket is created in Freshdesk
- `updated_ticket`: Triggers when a ticket is updated in Freshdesk

### mastodon (from mastodon)

The mastodon plugin provides integration with Mastodon, an open-source decentralized social network, allowing you to automate posting, account management, and more.

**Actions:**

- `post_status`: Post a status to Mastodon with optional media attachments
- `get_account`: Retrieve a Mastodon account by ID
- `custom_api_call`: Make a custom API call to the Mastodon API

### reddit (from reddit)

The reddit plugin provides integration with Reddit, a social news and discussion platform, allowing you to automate interactions with Reddit's API.

**Actions:**

- `get_subreddit`: Get information about a subreddit
- `submit_post`: Submit a new post to a subreddit
- `custom_api_call`: Make a custom API call to the Reddit API

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

The s3-storage plugin provides integration with Amazon S3 and S
