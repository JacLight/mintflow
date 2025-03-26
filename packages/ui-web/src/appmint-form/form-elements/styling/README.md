# Form Elements Styling System

This directory contains the new styling system for form elements. The system provides a flexible and consistent way to style form elements using a component-based approach.

## Overview

The new styling system replaces the legacy `x-ui` approach with a more structured and maintainable solution. It offers several key improvements:

1. **Component-Based**: Each form element is composed of multiple parts that can be styled independently.
2. **Hierarchical**: Styles are applied in a clear hierarchy (common → component → custom).
3. **Tailwind Integration**: Seamless integration with Tailwind CSS for consistent styling.
4. **Backward Compatible**: Support for the legacy `x-ui` format with automatic conversion.
5. **Accessibility**: Improved accessibility with proper ARIA attributes and focus states.

## Key Files

- **`index.ts`**: Exports the main styling components and utilities.
- **`StyledComponent.tsx`**: The core component that handles styling application.
- **`style-utils.ts`**: Utility functions for extracting and applying styles.
- **`theme.ts`**: Default theme definitions for all components.
- **`COMPONENT_PARTS.md`**: Documentation of all component parts that can be styled.
- **`MIGRATION_STATUS.md`**: Status of component migration to the new styling system.

## How to Use

### Basic Usage

To style a component, use the `styling` property in your schema:

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

### Component Parts

Each component is divided into parts that can be styled independently. For example, a text input has the following parts:

- `container`: The outer container
- `label`: The label of the input
- `input`: The input field itself
- `description`: Help text or description
- `error`: Error message

For a complete list of all component parts, see [COMPONENT_PARTS.md](./COMPONENT_PARTS.md).

### Styling Options

Each part can be styled using the following options:

- `classes`: An array of Tailwind CSS classes to apply.
- `style`: A JavaScript object with CSS properties (camelCase).

### Styling Hierarchy

Styles are applied in the following order:

1. **Base Styles**: Default styles defined in the theme.
2. **Component Styles**: Styles specific to the component type.
3. **Custom Styles**: Styles provided in the schema.

This hierarchy allows for consistent styling while still providing flexibility for customization.

## Migration from Legacy `x-ui`

The new styling system is designed to be backward compatible with the legacy `x-ui` approach. The system automatically converts `x-ui` properties to the new format.

For example, the following legacy format:

```javascript
{
  "x-ui": {
    "input": {
      "classes": ["bg-gray-50", "rounded-lg"]
    }
  }
}
```

Is equivalent to:

```javascript
{
  "styling": {
    "text": {
      "input": {
        "classes": ["bg-gray-50", "rounded-lg"]
      }
    }
  }
}
```

### Migration Status

As of the latest update, we have migrated **38 out of 42** components (90.5%) to the new styling system. The migration is ongoing, with priority given to the most commonly used components.

Key components that have been migrated include:

- All basic input elements (Text, Number, Date, etc.)
- Selection elements (Checkbox, Radio, List)
- Layout elements (Label, Paragraph, Notice, Button)
- Special elements (Slider, Slider Range, Number Range, Social Textarea, Data View)

For a complete list of migrated components and their status, see [MIGRATION_STATUS.md](./MIGRATION_STATUS.md).

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
```

### Custom Slider Range

```javascript
{
  "type": "array",
  "title": "Price Range",
  "items": {
    "type": "number"
  },
  "minItems": 2,
  "maxItems": 2,
  "styling": {
    "slider-range": {
      "container": {
        "classes": ["p-4", "bg-gray-50", "rounded-lg"]
      },
      "minTrack": {
        "classes": ["mt-2"]
      },
      "maxTrack": {
        "classes": ["mt-4"]
      },
      "rail": {
        "classes": ["bg-gray-300"]
      },
      "thumb": {
        "classes": ["bg-blue-600", "hover:bg-blue-700"]
      },
      "value": {
        "classes": ["text-blue-700", "font-semibold", "text-center", "mt-2"]
      }
    }
  }
}
```

### Custom Social Textarea

```javascript
{
  "type": "string",
  "title": "Social Media Post",
  "styling": {
    "social-textarea": {
      "container": {
        "classes": ["bg-gray-50", "rounded-lg", "p-2"]
      },
      "textarea": {
        "classes": ["border-gray-300", "focus:ring-blue-500", "focus:border-blue-500", "rounded-md"]
      },
      "controls": {
        "classes": ["flex", "justify-between", "items-center", "mt-2", "border-t", "pt-2"]
      },
      "counter": {
        "classes": ["text-green-600", "font-medium"]
      },
      "counterWarning": {
        "classes": ["text-yellow-600", "font-medium"]
      },
      "counterError": {
        "classes": ["text-red-600", "font-medium"]
      }
    }
  }
}
```

### Custom Data View

```javascript
{
  "type": "object",
  "title": "Data View",
  "styling": {
    "data-view": {
      "container": {
        "classes": ["bg-white", "shadow-md", "rounded-lg", "p-4"]
      },
      "emptyMessage": {
        "classes": ["text-gray-500", "italic", "text-center", "py-8"]
      },
      "itemContainer": {
        "classes": ["border-b", "border-gray-200", "py-2"]
      },
      "item": {
        "classes": ["flex", "justify-between", "items-center"]
      },
      "key": {
        "classes": ["font-semibold", "text-gray-700"]
      },
      "value": {
        "classes": ["text-gray-600"]
      }
    }
  }
}
```

### Custom Date Time Picker

```javascript
{
  "type": "string",
  "title": "Event Date and Time",
  "format": "date-time",
  "styling": {
    "date-time-picker": {
      "container": {
        "classes": ["bg-indigo-50", "shadow-md", "rounded-lg", "p-4"]
      },
      "inputContainer": {
        "classes": ["flex", "space-x-2", "mt-2"]
      },
      "input": {
        "classes": ["border-indigo-300", "focus:ring-indigo-500", "focus:border-indigo-500", "rounded-md"]
      },
      "controls": {
        "classes": ["space-y-3", "mb-3", "border-b", "border-indigo-200", "pb-3"]
      },
      "select": {
        "classes": ["bg-white", "border-indigo-300", "rounded-md", "text-indigo-700"]
      },
      "error": {
        "classes": ["text-red-600", "font-medium", "text-center", "mt-2"]
      },
      "preview": {
        "classes": ["mt-4", "bg-white", "rounded-md", "p-3", "border", "border-indigo-200"]
      },
      "previewTitle": {
        "classes": ["text-indigo-700", "font-semibold"]
      },
      "previewContent": {
        "classes": ["text-indigo-600"]
      }
    }
  }
}
```

### Custom File Upload

```javascript
{
  "type": "string",
  "title": "Upload Documents",
  "format": "file",
  "styling": {
    "file-element": {
      "container": {
        "classes": ["bg-blue-50", "rounded-lg", "p-4"]
      },
      "dropzone": {
        "classes": ["border-2", "border-dashed", "border-blue-300", "bg-white", "rounded-lg", "p-6", "text-center"]
      },
      "dropzoneActive": {
        "classes": ["border-blue-500", "bg-blue-50"]
      },
      "button": {
        "classes": ["bg-blue-500", "text-white", "px-4", "py-2", "rounded-md", "hover:bg-blue-600", "transition-colors"]
      },
      "fileList": {
        "classes": ["mt-4", "space-y-2"]
      },
      "fileItem": {
        "classes": ["flex", "items-center", "bg-white", "p-3", "rounded-md", "border", "border-blue-200"]
      },
      "filePreview": {
        "classes": ["w-12", "h-12", "object-cover", "rounded-md", "mr-3"]
      },
      "fileInfo": {
        "classes": ["flex-grow"]
      },
      "fileName": {
        "classes": ["font-medium", "text-blue-700"]
      },
      "fileSize": {
        "classes": ["text-xs", "text-gray-500"]
      },
      "progressBar": {
        "classes": ["h-1", "bg-blue-200", "rounded-full", "mt-1"]
      },
      "deleteButton": {
        "classes": ["text-red-500", "hover:text-red-700"]
      },
      "errorMessage": {
        "classes": ["text-red-500", "text-sm", "mt-1"]
      }
    }
  }
}
```

### Custom Code Editor

```javascript
{
  "type": "string",
  "title": "JavaScript Code",
  "format": "code",
  "styling": {
    "code-element": {
      "container": {
        "classes": ["rounded-lg", "overflow-hidden", "shadow-lg", "border", "border-gray-300"]
      },
      "editor": {
        "classes": ["font-mono", "text-sm"]
      },
      "appBar": {
        "classes": ["bg-gray-800", "text-white", "p-2", "flex", "justify-end", "items-center", "space-x-2"]
      },
      "button": {
        "classes": ["p-1", "rounded", "hover:bg-gray-700", "transition-colors"]
      },
      "saveButton": {
        "classes": ["text-green-400", "hover:text-green-300"]
      },
      "expandButton": {
        "classes": ["text-blue-400", "hover:text-blue-300"]
      },
      "loading": {
        "classes": ["text-gray-400", "italic", "text-center", "py-4"]
      }
    }
  }
}
```

### Custom Cron Schedule Editor

```javascript
{
  "type": "string",
  "title": "Schedule",
  "format": "cron",
  "styling": {
    "cron-element": {
      "container": {
        "classes": ["bg-gray-50", "rounded-lg", "shadow-md", "p-4"]
      },
      "expressionContainer": {
        "classes": ["bg-white", "rounded", "p-3", "mb-3", "border", "border-gray-200"]
      },
      "expression": {
        "classes": ["font-mono", "text-sm", "text-blue-600"]
      },
      "summary": {
        "classes": ["text-xs", "text-gray-600", "italic"]
      },
      "primaryButton": {
        "classes": ["bg-blue-500", "text-white", "px-3", "py-1", "rounded", "text-xs", "hover:bg-blue-600"]
      },
      "secondaryButton": {
        "classes": ["bg-gray-200", "text-gray-700", "px-3", "py-1", "rounded", "text-xs", "hover:bg-gray-300"]
      },
      "tabsContainer": {
        "classes": ["flex", "border-b", "border-gray-200", "mb-4"]
      },
      "tab": {
        "classes": ["px-3", "py-1", "text-sm", "text-gray-600", "hover:text-gray-800"]
      },
      "activeTab": {
        "classes": ["px-3", "py-1", "text-sm", "border-b-2", "border-blue-500", "text-blue-600", "font-medium"]
      },
      "fieldContainer": {
        "classes": ["mb-3"]
      },
      "label": {
        "classes": ["block", "text-xs", "font-medium", "text-gray-700", "mb-1"]
      },
      "select": {
        "classes": ["border", "border-gray-300", "rounded", "p-1", "text-sm", "focus:ring-blue-500", "focus:border-blue-500"]
      },
      "input": {
        "classes": ["w-full", "border", "border-gray-300", "rounded", "p-1", "text-sm", "focus:ring-blue-500", "focus:border-blue-500"]
      },
      "dayButton": {
        "classes": ["w-6", "h-6", "rounded-full", "text-xs", "bg-gray-100", "hover:bg-gray-200"]
      },
      "activeDayButton": {
        "classes": ["w-6", "h-6", "rounded-full", "text-xs", "bg-blue-500", "text-white"]
      },
      "quickButton": {
        "classes": ["px-2", "py-1", "text-xs", "bg-gray-100", "hover:bg-gray-200", "rounded", "mr-1", "mb-1"]
      }
    }
  }
}
```

### Custom Icon Picker

```javascript
{
  "type": "string",
  "title": "Select Icon",
  "format": "icon",
  "styling": {
    "icon-picker-element": {
      "container": {
        "classes": ["bg-white", "rounded-lg", "p-3", "border", "border-gray-200"]
      },
      "icon": {
        "classes": ["w-8", "h-8", "text-indigo-600"]
      },
      "button": {
        "classes": ["bg-indigo-50", "text-indigo-700", "px-3", "py-2", "rounded", "hover:bg-indigo-100", "transition-colors"]
      },
      "dropdown": {
        "classes": ["bg-white", "shadow-lg", "rounded-md", "border", "border-gray-200", "p-3", "max-h-60", "overflow-y-auto"]
      },
      "search": {
        "classes": ["w-full", "border", "border-gray-300", "rounded", "p-2", "mb-3", "focus:ring-indigo-500", "focus:border-indigo-500"]
      },
      "option": {
        "classes": ["p-2", "rounded", "hover:bg-gray-100", "cursor-pointer"]
      },
      "selectedOption": {
        "classes": ["p-2", "rounded", "bg-indigo-100", "text-indigo-700", "cursor-pointer"]
      }
    }
  }
}
```

### Custom UUID Generator

```javascript
{
  "type": "string",
  "title": "Unique Identifier",
  "format": "uuid",
  "styling": {
    "uuid-element": {
      "container": {
        "classes": ["bg-gray-50", "rounded-lg", "p-3", "border", "border-gray-200"]
      },
      "value": {
        "classes": ["font-mono", "text-sm", "text-gray-700", "select-all"]
      },
      "button": {
        "classes": ["p-1.5", "rounded-full", "bg-white", "shadow-sm", "hover:bg-gray-100", "transition-colors", "ml-2"]
      },
      "icon": {
        "classes": ["w-4", "h-4", "text-blue-600"]
      }
    }
  }
}
```

### Custom Phone Input

```javascript
{
  "type": "string",
  "title": "Phone Number",
  "format": "phone",
  "styling": {
    "phone": {
      "container": {
        "classes": ["bg-gray-50", "rounded-lg", "border", "border-gray-200", "overflow-hidden"]
      },
      "dropdownButton": {
        "classes": ["bg-blue-50", "text-blue-700", "border-r", "border-blue-200", "hover:bg-blue-100", "transition-colors"]
      },
      "dropdownMenu": {
        "classes": ["bg-white", "shadow-xl", "rounded-md", "border", "border-blue-100", "mt-1"]
      },
      "dropdownItem": {
        "classes": ["hover:bg-blue-50", "transition-colors"]
      },
      "dropdownItemSelected": {
        "classes": ["bg-blue-100", "text-blue-800"]
      },
      "input": {
        "classes": ["border-0", "focus:ring-blue-500", "text-gray-800", "placeholder-gray-400"]
      },
      "flag": {
        "classes": ["rounded-sm", "mr-2"]
      }
    }
  }
}
```

## Best Practices

1. **Use Tailwind Classes**: Prefer using Tailwind classes for styling when possible, as they provide a consistent design system.

2. **Avoid Inline Styles**: Use inline styles only when necessary, such as for dynamic values or when a specific style cannot be achieved with Tailwind.

3. **Maintain Accessibility**: Ensure that your styling maintains accessibility, such as proper contrast ratios and focus states.

4. **Be Consistent**: Use consistent styling across your forms to provide a cohesive user experience.

5. **Test Responsiveness**: Test your styling on different screen sizes to ensure it works well on all devices.

## Contributing

When adding new components or modifying existing ones, please follow these guidelines:

1. Use the `StyledComponent` for all component parts.
2. Extract styling from the schema using `extractStylingFromSchema`.
3. Apply styling using `getComponentPartStyling`.
4. Update the component parts documentation in `COMPONENT_PARTS.md`.
5. Update the migration status in `MIGRATION_STATUS.md`.

## Future Improvements

1. **Theme Customization**: Allow for global theme customization.
2. **Style Presets**: Provide pre-defined style presets for common use cases.
3. **Style Editor**: Create a visual style editor for easier customization.
4. **Style Validation**: Validate styles to ensure they meet accessibility standards.
5. **Style Export/Import**: Allow for exporting and importing styles between forms.
