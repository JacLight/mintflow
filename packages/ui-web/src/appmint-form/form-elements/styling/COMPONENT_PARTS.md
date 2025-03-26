# Component Parts Styling Reference

This document provides a comprehensive list of all component parts that can be styled using the new styling system. Each component has specific parts that can be individually styled, allowing for fine-grained control over the appearance of your forms.

## How to Use Component Parts

Component parts can be styled using the `styling` property in your schema. For example:

```javascript
{
  "type": "string",
  "title": "First Name",
  "styling": {
    "text": {
      "container": {
        "classes": ["bg-gray-50", "rounded-lg"],
        "style": { "borderColor": "#3b82f6" }
      },
      "input": {
        "classes": ["text-lg", "font-medium"],
        "style": { "color": "#1f2937" }
      }
    }
  }
}
```

## Common Parts

These parts are available for most components:

| Part | Description |
|------|-------------|
| `container` | The outer container of the component |
| `label` | The label of the component |
| `label-inner` | Inner container for the label |
| `input-container` | Container for the input element |
| `description` | Help text or description |
| `error` | Error message |
| `helpContainer` | Container for help text |
| `icon` | Icon element |
| `iconContainer` | Container for the icon |

## Component-Specific Parts

### Text Element (`text`)

| Part | Description |
|------|-------------|
| `input` | The text input field |
| `prefix` | Content displayed before the input |
| `suffix` | Content displayed after the input |

### Textarea Element (`textarea`)

| Part | Description |
|------|-------------|
| `input` | The textarea field |
| `resize-handle` | The resize handle for the textarea |

### Number Element (`number`)

| Part | Description |
|------|-------------|
| `input` | The number input field |
| `prefix` | Content displayed before the input |
| `suffix` | Content displayed after the input |
| `stepper` | Container for the stepper buttons |
| `stepperUp` | The increment button |
| `stepperDown` | The decrement button |

### Date Element (`date`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `input` | The date input field |
| `prefix` | Content displayed before the input |
| `suffix` | Content displayed after the input |
| `calendar` | The calendar popup |
| `calendarHeader` | The header of the calendar |
| `calendarDays` | The days of the calendar |
| `calendarDay` | A single day in the calendar |
| `calendarDaySelected` | The selected day in the calendar |
| `calendarDayToday` | Today's date in the calendar |

### Date Range (`date-range`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `startContainer` | Container for the start date |
| `endContainer` | Container for the end date |
| `separator` | The separator between start and end dates |
| `input` | The date input fields |
| `calendar` | The calendar popup |

### Date Time Picker (`date-time-picker`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `controls` | The controls section for mode and options |
| `label` | Labels for controls |
| `select` | Select dropdown for mode selection |
| `checkbox` | Checkboxes for options |
| `inputContainer` | Container for the input fields |
| `input` | The date/time input fields |
| `presetSelector` | The preset date range selector |
| `error` | Error message display |
| `preview` | Preview section for selected dates/times |
| `previewTitle` | Title for the preview section |
| `previewContent` | Content of the preview section |

### Color Element (`color`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `preview` | The color preview box |
| `palette` | The color palette container |
| `paletteItem` | A single color in the palette |
| `input` | The color input field |

### File Element (`file-element`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `dropzone` | The file drop zone area |
| `dropzoneActive` | The drop zone when a file is being dragged over it |
| `button` | The file selection button |
| `fileList` | The list of uploaded files |
| `fileItem` | A single file item in the list |
| `filePreview` | The preview of a file (image thumbnail) |
| `fileInfo` | Container for file information |
| `fileName` | The name of the file |
| `fileSize` | The size of the file |
| `progressBar` | The upload progress bar |
| `deleteButton` | Button to delete a file |
| `errorMessage` | Error message display |

### Code Element (`code-element`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `editor` | The code editor area |
| `appBar` | The toolbar above the editor |
| `button` | Generic button in the app bar |
| `saveButton` | The save button |
| `expandButton` | The expand/collapse button |
| `loading` | Loading indicator when the editor is initializing |

### Cron Element (`cron-element`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `expressionContainer` | Container for the cron expression display |
| `expression` | The cron expression text |
| `summary` | Human-readable summary of the schedule |
| `button` | Generic button |
| `primaryButton` | Primary action button (e.g., Copy) |
| `secondaryButton` | Secondary action button (e.g., Clear) |
| `tabsContainer` | Container for the tabs |
| `tab` | A tab button |
| `activeTab` | The currently active tab |
| `tabContent` | The content area for the active tab |
| `fieldContainer` | Container for a field group |
| `label` | Label for a field |
| `input` | Text input field |
| `select` | Dropdown select field |
| `dayButton` | Button for day selection |
| `activeDayButton` | Selected day button |
| `quickButton` | Quick preset button |

### Icon Picker Element (`icon-picker-element`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `icon` | The selected icon display |
| `button` | Button to open the icon picker |
| `dropdown` | The dropdown container for icon selection |
| `search` | Search input for filtering icons |
| `option` | A single icon option |
| `selectedOption` | The currently selected icon option |

### UUID Element (`uuid-element`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `value` | The UUID value display |
| `button` | Button to regenerate the UUID |
| `icon` | Icon inside the regenerate button |

### Phone Element (`phone`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `dropdownButton` | Button to open the country code dropdown |
| `dropdownMenu` | The dropdown menu for country selection |
| `dropdownItem` | A single country option in the dropdown |
| `dropdownItemSelected` | The currently selected country option |
| `input` | The phone number input field |
| `flag` | The country flag icon |

### Select Many Checkbox (`select-many-checkbox`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `option` | A single checkbox option container |
| `input` | The checkbox input |
| `label` | The label for a checkbox |
| `description` | Description for a checkbox option |

### Select Many Radio (`select-many-radio`)

| Part | Description |
|------|-------------|
| `group` | The radio group container |
| `option` | A single radio option container |
| `optionSelected` | A selected radio option |
| `optionUnselected` | An unselected radio option |
| `label` | The label for a radio option |
| `labelSelected` | The label for a selected radio option |
| `labelUnselected` | The label for an unselected radio option |
| `icon` | The radio button icon |
| `checkmark` | The checkmark inside the radio button |

### Select Many List (`select-many-list`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `button` | The button that opens the list |
| `options` | The container for the list options |
| `option` | A single option in the list |
| `optionActive` | An active option in the list |
| `optionInactive` | An inactive option in the list |
| `icon` | Icon for an option |
| `selectedIcon` | Icon for a selected option |
| `label` | Label for the list |
| `placeholder` | Placeholder text |
| `chevron` | The dropdown chevron icon |

### Select Many Combo (`select-many-combo`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `input` | The input field |
| `button` | The button that opens the dropdown |
| `dropdown` | The dropdown container |
| `option` | A single option in the dropdown |
| `selectedOption` | A selected option in the dropdown |
| `selectedTag` | A tag for a selected option |
| `clearButton` | Button to clear the selection |
| `addButton` | Button to add a new option |

### Switch Element (`switch`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `track` | The track of the switch |
| `thumb` | The thumb of the switch |
| `icon` | Icon inside the thumb |
| `label` | Label for the switch |
| `labelOn` | Label when the switch is on |
| `labelOff` | Label when the switch is off |

### Label Element (`label`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `text` | The label text |

### Paragraph Element (`paragraph`)

| Part | Description |
|------|-------------|
| `container` | The outer container |

### Notice Element (`notice`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `icon` | The notice icon |
| `title` | The notice title |
| `content` | The notice content |

### Button Element (`button`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `button` | The button element |
| `label` | The button label |
| `description` | The button description |
| `error` | Error message |

### Shadow Element (`shadow`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `header` | The header section |
| `button` | Buttons in the shadow element |
| `content` | The content section |
| `canvas` | The canvas for shadow preview |
| `controls` | The controls section |
| `code` | The code display section |

### Markdown Element (`markdown`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `editor` | The markdown editor |

### Question Element (`question`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `label` | The question label |
| `range` | The range input container |
| `input` | The input fields |

### Preview Element (`preview`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `image` | The preview image |
| `placeholder` | Placeholder when no image is available |

## Special Elements

### Richtext Element (`richtext`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `toolbar` | The toolbar container |
| `toolbarButton` | A button in the toolbar |
| `editor` | The rich text editor |

### Map Element (`map`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `map` | The map container |
| `controls` | The map controls |
| `marker` | A marker on the map |
| `infoWindow` | An info window on the map |

### Rating (`rating`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `star` | A single star |
| `starFilled` | A filled star |
| `starEmpty` | An empty star |
| `starHalf` | A half-filled star |

### Slider (`slider`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `track` | The slider track |
| `thumb` | The slider thumb |
| `rail` | The slider rail |
| `mark` | A mark on the slider |
| `markLabel` | A label for a mark |
| `value` | The value display |
| `input` | The input field for direct value entry |

### Slider Range (`slider-range`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `minTrack` | The track for the minimum value slider |
| `maxTrack` | The track for the maximum value slider |
| `rail` | The slider rail |
| `thumb` | The slider thumbs |
| `value` | The value display |

### Number Range Element (`number-range`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `minInputContainer` | Container for the minimum value input |
| `maxInputContainer` | Container for the maximum value input |
| `minInput` | The input field for the minimum value |
| `maxInput` | The input field for the maximum value |
| `separator` | The separator between min and max inputs |

### Social Textarea (`social-textarea`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `textarea` | The textarea input |
| `controls` | The controls container |
| `platformSelector` | The social platform selector |
| `iconPicker` | The icon picker |
| `counter` | The character counter |
| `counterWarning` | The character counter in warning state |
| `counterError` | The character counter in error state |
| `suggestions` | The suggestions dropdown |
| `suggestionItem` | A single suggestion item |
| `suggestionSelected` | A selected suggestion item |

### Data View Element (`data-view`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `emptyMessage` | Message shown when no data is available |
| `itemContainer` | Container for a data item |
| `item` | A single data item |
| `value` | A data value |
| `key` | A data key |
| `objectContainer` | Container for object data |
| `objectItem` | A single object item |
| `deleteButton` | Button to delete an item |

### Generated Element (`generated-element`)

| Part | Description |
|------|-------------|
| `container` | The outer container |
| `value` | The generated value display |
| `button` | The regenerate button |
| `icon` | The icon in the regenerate button |

## Styling Best Practices

1. **Use Tailwind Classes**: Prefer using Tailwind classes for styling when possible, as they provide a consistent design system.

2. **Avoid Inline Styles**: Use inline styles only when necessary, such as for dynamic values or when a specific style cannot be achieved with Tailwind.

3. **Maintain Accessibility**: Ensure that your styling maintains accessibility, such as proper contrast ratios and focus states.

4. **Be Consistent**: Use consistent styling across your forms to provide a cohesive user experience.

5. **Test Responsiveness**: Test your styling on different screen sizes to ensure it works well on all devices.

## Examples

### Custom Text Input

```javascript
{
  "type": "string",
  "title": "Email Address",
  "styling": {
    "text": {
      "container": {
        "classes": ["bg-blue-50", "rounded-lg", "p-2"]
      },
      "label": {
        "classes": ["text-blue-700", "font-semibold"]
      },
      "input": {
        "classes": ["border-blue-300", "focus:ring-blue-500", "focus:border-blue-500"]
      },
      "description": {
        "classes": ["text-blue-600", "text-xs", "mt-1"]
      }
    }
  }
}
```

### Custom Radio Group

```javascript
{
  "type": "string",
  "title": "Subscription Plan",
  "enum": ["basic", "premium", "enterprise"],
  "enumNames": ["Basic", "Premium", "Enterprise"],
  "styling": {
    "select-many-radio": {
      "group": {
        "classes": ["space-y-3", "mt-2"]
      },
      "option": {
        "classes": ["flex", "items-center", "p-2", "border", "rounded-md"]
      },
      "optionSelected": {
        "classes": ["border-indigo-500", "bg-indigo-50"]
      },
      "optionUnselected": {
        "classes": ["border-gray-300", "hover:bg-gray-50"]
      },
      "label": {
        "classes": ["ml-3", "font-medium"]
      }
    }
  }
}
