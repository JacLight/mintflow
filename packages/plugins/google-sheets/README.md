# Google Sheets Plugin for MintFlow

This plugin provides integration with Google Sheets, allowing you to interact with spreadsheets, worksheets, and data.

## Features

- Create, update, and delete rows in spreadsheets
- Find and filter rows based on column values
- Create new spreadsheets and worksheets
- Copy worksheets between spreadsheets
- Clear sheet data
- Create new columns
- Insert and update multiple rows at once

## Installation

```bash
npm install @mintflow/google-sheets
```

## Authentication

To use this plugin, you need a Google OAuth2 access token with the following scopes:

- `https://www.googleapis.com/auth/spreadsheets` - For read/write access to spreadsheets
- `https://www.googleapis.com/auth/drive.readonly` - For listing spreadsheets
- `https://www.googleapis.com/auth/drive` - For creating spreadsheets

You can obtain an access token through the Google OAuth2 flow. The token should be passed to the plugin for each operation.

## Usage

### Insert a Row

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "insert_row",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    values: {
      A: "Value 1",
      B: "Value 2",
      C: "Value 3"
    },
    asString: true,
    firstRowHeaders: true
  }
});
```

### Update a Row

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "update_row",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    rowIndex: 2,
    values: {
      A: "Updated Value 1",
      B: "Updated Value 2",
      C: "Updated Value 3"
    },
    asString: true,
    firstRowHeaders: true
  }
});
```

### Delete a Row

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "delete_row",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    rowIndex: 2
  }
});
```

### Find Rows

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "find_rows",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    columnName: "A",
    columnValue: "Value 1",
    firstRowHeaders: true
  }
});
```

### Get Rows

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "get_rows",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    rowIndexStart: 1,
    rowIndexEnd: 10
  }
});
```

### Create a Spreadsheet

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "create_spreadsheet",
    accessToken: "your-google-oauth2-token",
    title: "New Spreadsheet"
  }
});
```

### Create a Worksheet

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "create_worksheet",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    title: "New Worksheet",
    rows: 100,
    columns: 26
  }
});
```

### Clear a Sheet

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "clear_sheet",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    rowIndex: 2,
    numOfRows: 5
  }
});
```

### Find a Row by Number

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "find_row_by_num",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    rowIndex: 2
  }
});
```

### Find Spreadsheets

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "find_spreadsheets",
    accessToken: "your-google-oauth2-token",
    includeTeamDrives: true,
    searchValue: "Budget"
  }
});
```

### Find a Worksheet

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "find_worksheet",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    worksheetId: 0
  }
});
```

### Copy a Worksheet

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "copy_worksheet",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sourceSheetId: 0,
    destinationSpreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    title: "Copy of Sheet1"
  }
});
```

### Insert Multiple Rows

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "insert_multiple_rows",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    rowsData: [
      { A: "Row 1 Value 1", B: "Row 1 Value 2" },
      { A: "Row 2 Value 1", B: "Row 2 Value 2" }
    ],
    asString: true,
    firstRowHeaders: true
  }
});
```

### Update Multiple Rows

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "update_multiple_rows",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    startRowIndex: 2,
    rowsData: [
      { A: "Updated Row 1 Value 1", B: "Updated Row 1 Value 2" },
      { A: "Updated Row 2 Value 1", B: "Updated Row 2 Value 2" }
    ],
    asString: true,
    firstRowHeaders: true
  }
});
```

### Create a Column

```javascript
const result = await mintflow.run({
  plugin: "google-sheets",
  input: {
    action: "create_column",
    accessToken: "your-google-oauth2-token",
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetId: 0,
    columnName: "New Column",
    afterColumn: "B"
  }
});
```

## API Reference

For more details on the Google Sheets API, see the [official documentation](https://developers.google.com/sheets/api/reference/rest).
