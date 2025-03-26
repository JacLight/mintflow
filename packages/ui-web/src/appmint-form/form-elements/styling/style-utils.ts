import { twMerge } from 'tailwind-merge';
import { baseTheme, ComponentStyling, minimalTheme, primaryTheme, secondaryTheme, ThemeStyling } from './theme-settings';


/**
 * Built-in themes
 */
export const themes: Record<string, ThemeStyling> = {
    // Default theme is the base theme
    default: baseTheme,
    // Other themes
    primary: primaryTheme,
    secondary: secondaryTheme,
    minimal: minimalTheme,
};

/**
 * Get styling for a component part
 * 
 * @param componentType The type of component (text, select, checkbox, etc.)
 * @param part The part of the component to style (container, label, input, etc.)
 * @param theme The theme to use (can be a string name or a theme object)
 * @param customStyling Custom styling to override theme styling
 * @returns The Tailwind classes for the component part
 */
export function getComponentPartStyling(
    componentType: string,
    part: string,
    layout: string,
    theme: string | ThemeStyling = 'default',
    customStyling?: ComponentStyling
): string {
    // Get the theme object
    let themeObj: ThemeStyling;

    if (typeof theme === 'string') {
        // If theme is a string, look it up in the themes object
        themeObj = themes[theme] || themes.default;
    } else if (typeof theme === 'object') {
        // If theme is an object, use it directly
        themeObj = theme;
    } else {
        // Default to the default theme
        themeObj = themes.default;
    }

    // Get common styling for all components
    const commonStyling = themeObj.common || {};

    // Get component-specific styling
    const componentStyling = themeObj[componentType] || {};

    // Combine common and component-specific styling
    let styling = '';

    // Add common styling for the part if it exists (group level)
    if (typeof commonStyling[part] === 'string') {
        styling = commonStyling[part] as string;
    }

    // Add component-specific styling for the part if it exists
    if (typeof componentStyling[part] === 'string') {
        styling = twMerge(styling, componentStyling[part] as string);
    }

    // Add custom styling at the group level if it exists
    if (customStyling && typeof customStyling[part] === 'string') {
        styling = twMerge(styling, customStyling[part] as string);
    }

    // Add custom styling at the specific level if it exists
    // Format: componentType.part (e.g., "text.input")
    const specificKey = `${componentType}.${part}`;
    if (customStyling && typeof customStyling[specificKey] === 'string') {
        styling = twMerge(styling, customStyling[specificKey] as string);
    }

    return styling;
}

/**
 * Get styling for a nested component part
 * 
 * @param componentType The type of component (text, select, checkbox, etc.)
 * @param parent The parent part (e.g., 'item')
 * @param part The part of the component to style (container, label, input, etc.)
 * @param theme The theme to use (can be a string name or a theme object)
 * @param customStyling Custom styling to override theme styling
 * @returns The Tailwind classes for the component part
 */
export function getNestedComponentPartStyling(
    componentType: string,
    parent: string,
    part: string,
    theme: string | ThemeStyling = 'default',
    customStyling?: ComponentStyling
): string {
    // Get the theme object
    let themeObj: ThemeStyling;

    if (typeof theme === 'string') {
        // If theme is a string, look it up in the themes object
        themeObj = themes[theme] || themes.default;
    } else if (typeof theme === 'object') {
        // If theme is an object, use it directly
        themeObj = theme;
    } else {
        // Default to the default theme
        themeObj = themes.default;
    }

    // Get common styling for all components
    const commonStyling = themeObj.common || {};

    // Get component-specific styling
    const componentStyling = themeObj[componentType] || {};

    // Get parent styling from common
    const commonParentStyling = commonStyling[parent] as ComponentStyling || {};

    // Get parent styling from component
    const componentParentStyling = componentStyling[parent] as ComponentStyling || {};

    // Get custom parent styling
    const customParentStyling = customStyling && customStyling[parent] as ComponentStyling;

    // Combine parent and custom parent styling
    let styling = '';

    // Add common parent styling for the part if it exists
    if (typeof commonParentStyling[part] === 'string') {
        styling = commonParentStyling[part] as string;
    }

    // Add component parent styling for the part if it exists
    if (typeof componentParentStyling[part] === 'string') {
        styling = twMerge(styling, componentParentStyling[part] as string);
    }

    // Add custom parent styling for the part if it exists
    if (customParentStyling && typeof customParentStyling[part] === 'string') {
        styling = twMerge(styling, customParentStyling[part] as string);
    }

    // Add custom styling at the specific level if it exists
    // Format: componentType.parent.part (e.g., "array.item.label")
    const specificKey = `${componentType}.${parent}.${part}`;
    if (customStyling && typeof customStyling[specificKey] === 'string') {
        styling = twMerge(styling, customStyling[specificKey] as string);
    }

    // If no styling was found, try to get styling for the part directly
    if (!styling) {
        styling = getComponentPartStyling(componentType, part, '', theme, customStyling);
    }

    return styling;
}

/**
 * Extract styling from schema
 * 
 * @param schema The schema object
 * @returns The styling object
 */
export function extractStylingFromSchema(schema: any): ComponentStyling | undefined {
    if (!schema) return undefined;

    // Check for styling property
    if (schema.styling) {
        return schema.styling;
    }

    // Check for x-ui property (legacy support)
    if (schema['x-ui']) {
        // Convert x-ui format to styling format
        const styling: ComponentStyling = {};

        // Process each key in x-ui
        Object.keys(schema['x-ui']).forEach(key => {
            const uiItem = schema['x-ui'][key];

            // Convert classes array to string
            if (uiItem.classes && Array.isArray(uiItem.classes)) {
                styling[key] = uiItem.classes.join(' ');
            }

            // TODO: Handle style object if needed
        });

        return styling;
    }

    return undefined;
}
