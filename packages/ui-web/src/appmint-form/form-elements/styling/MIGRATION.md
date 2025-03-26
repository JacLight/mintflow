# Migration Guide: From x-ui to styling

This guide will help you migrate from the old `x-ui` styling approach to the new `styling` system.

## Overview of Changes

The new styling system provides a more consistent, intuitive, and powerful way to customize the appearance of form elements using Tailwind CSS.

### Key Improvements

1. **Simplified Structure**: A flat object structure with clear part names
2. **Direct Tailwind Classes**: Use Tailwind classes directly instead of arrays
3. **Consistent Naming**: Standardized part names across all components
4. **Theme Support**: Built-in themes with the ability to override specific parts
5. **Better TypeScript Support**: Full type definitions for styling options

## Migration Steps

### 1. Replace `x-ui` with `styling`

**Before:**

```json
{
  "type": "string",
  "title": "Username",
  "x-ui": {
    "label": {
      "classes": ["text-blue-600", "font-medium"]
    },
    "input": {
      "classes": ["border-blue-300", "focus:ring-blue-500"]
    }
  }
}
```

**After:**

```json
{
  "type": "string",
  "title": "Username",
  "styling": {
    "label": "text-blue-600 font-medium",
    "input": "border-blue-300 focus:ring-blue-500"
  }
}
```

### 2. Convert Arrays to Strings

The new system uses strings of Tailwind classes instead of arrays.

**Before:**

```json
"x-ui": {
  "label": {
    "classes": ["text-blue-600", "font-medium"]
  }
}
```

**After:**

```json
"styling": {
  "label": "text-blue-600 font-medium"
}
```

### 3. Use Standardized Part Names

The new system uses standardized part names across all components.

Common part names:

- `container`: The outer container of the component
- `label`: The label of the component
- `input`: The input element
- `description`: The description/help text
- `error`: The error message

Component-specific part names are documented in the README.md file.

### 4. Use Theme Support

Instead of defining styles for every component, you can use themes.

**Before:**

```json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "x-ui": {
        "label": {
          "classes": ["text-blue-600", "font-medium"]
        },
        "input": {
          "classes": ["border-blue-300", "focus:ring-blue-500"]
        }
      }
    },
    "email": {
      "type": "string",
      "x-ui": {
        "label": {
          "classes": ["text-blue-600", "font-medium"]
        },
        "input": {
          "classes": ["border-blue-300", "focus:ring-blue-500"]
        }
      }
    }
  }
}
```

**After:**

```json
{
  "type": "object",
  "theme": "primary",
  "properties": {
    "username": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "styling": {
        "label": "text-lg" // Override just the label styling
      }
    }
  }
}
```

## Group and Component-Specific Styling

The new styling system supports two levels of specificity:

1. **Group-level styling**: Apply styles to all components of a certain part type
2. **Component-specific styling**: Apply styles to a specific component type's part

### Group-level Styling

Group-level styling applies to all components that have a particular part, regardless of the component type:

```json
"styling": {
  "label": "text-blue-600 font-medium", // Applies to all labels
  "input": "border-blue-300 focus:ring-blue-500" // Applies to all inputs
}
```

### Component-specific Styling

Component-specific styling applies only to a specific component type's part:

```json
"styling": {
  "text.input": "border-blue-300", // Only applies to text inputs
  "checkbox.input": "border-green-300" // Only applies to checkbox inputs
}
```

### Combining Both Approaches

You can combine both approaches for maximum flexibility:

```json
"styling": {
  "input": "border-gray-300", // Base styling for all inputs
  "text.input": "border-blue-300", // Override for text inputs
  "checkbox.input": "border-green-300" // Override for checkbox inputs
}
```

## Component-Specific Migration Notes

### Text Inputs

**Before:**

```json
"x-ui": {
  "control-label": {
    "classes": ["text-blue-600", "font-medium"]
  },
  "control-input": {
    "classes": ["border-blue-300", "focus:ring-blue-500"]
  },
  "control-help": {
    "classes": ["text-gray-500", "text-xs"]
  },
  "control-error": {
    "classes": ["text-red-500", "text-xs"]
  }
}
```

**After:**

```json
"styling": {
  "label": "text-blue-600 font-medium",
  "input": "border-blue-300 focus:ring-blue-500",
  "description": "text-gray-500 text-xs",
  "error": "text-red-500 text-xs"
}
```

### Radio Buttons

**Before:**

```json
"x-ui": {
  "control-label": {
    "classes": ["text-blue-600", "font-medium"]
  },
  "control-input": {
    "classes": ["border-blue-300", "focus:ring-blue-500"]
  }
}
```

**After:**

```json
"styling": {
  "label": "text-blue-600 font-medium",
  "option": "border-blue-300 focus:ring-blue-500",
  "optionSelected": "bg-blue-50 border-blue-200"
}
```

### Switch

**Before:**

```json
"x-ui": {
  "control-label": {
    "classes": ["text-blue-600", "font-medium"]
  },
  "control-input": {
    "classes": ["border-blue-300", "focus:ring-blue-500"]
  }
}
```

**After:**

```json
"styling": {
  "label": "text-blue-600 font-medium",
  "track": "focus:ring-blue-500",
  "trackOn": "bg-blue-600",
  "trackOff": "bg-gray-200"
}
```

## Automatic Migration

The new styling system includes a utility function that can automatically convert the old `x-ui` format to the new `styling` format:

```typescript
import { extractStylingFromSchema } from './styling';

// This will work with both x-ui and styling
const styling = extractStylingFromSchema(schema);
```

This function will:

1. Check if the schema has a `styling` property and use it if present
2. Otherwise, check if the schema has an `x-ui` property and convert it to the new format
3. Return undefined if neither is present

## Gradual Migration

You can migrate your components gradually:

1. Start by updating the core components that are used most frequently
2. Use the `extractStylingFromSchema` function to support both formats during the transition
3. Update your schemas to use the new `styling` property
4. Once all components and schemas are updated, you can remove the old `x-ui` code

## Need Help?

If you have any questions or need assistance with the migration, please refer to the README.md file or contact the development team.
