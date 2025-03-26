import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ComponentStyling, ThemeStyling, extractStylingFromSchema, getComponentPartStyling } from './style-utils';

interface StyledComponentProps {
    /**
     * The component type (text, select, checkbox, etc.)
     */
    componentType: string;

    /**
     * The part of the component to style (container, label, input, etc.)
     */
    part: string;

    /**
     * The theme to use (can be a string name or a theme object)
     */
    theme?: string | ThemeStyling;

    /**
     * The schema object that may contain styling information
     */
    schema?: any;

    /**
     * Additional className to apply
     */
    className?: string;

    /**
     * The HTML tag to use
     */
    as?: keyof JSX.IntrinsicElements;

    /**
     * Additional props to pass to the component
     */
    [key: string]: any;
}

/**
 * A component that applies styling based on the component type, part, theme, and schema
 */
export const StyledComponent: React.FC<StyledComponentProps> = ({
    componentType,
    part,
    theme = 'default',
    schema,
    className,
    as = 'div',
    children,
    ...props
}) => {
    // Extract styling from schema
    const customStyling = extractStylingFromSchema(schema);

    // Get styling for the component part, supporting both group-level and component-specific styling
    const styling = getComponentPartStyling(componentType, part, schema?.layout, theme, customStyling);

    // Combine with additional className
    const combinedClassName = twMerge(styling, className);

    // Create the component with the combined className
    return React.createElement(
        as,
        {
            className: combinedClassName,
            'data-component-type': componentType,
            'data-component-part': part,
            ...props
        },
        children
    );
};

/**
 * A component that applies styling to a container
 */
export const StyledContainer: React.FC<Omit<StyledComponentProps, 'part'>> = ({
    componentType,
    ...props
}) => {
    return <StyledComponent componentType={componentType} {...props} part="container" />;
};

/**
 * A component that applies styling to a label
 */
export const StyledLabel: React.FC<Omit<StyledComponentProps, 'part'>> = ({
    componentType,
    ...props
}) => {
    return <StyledComponent componentType={componentType} {...props} part="label" as="label" />;
};

/**
 * A component that applies styling to an input
 */
export const StyledInput: React.FC<Omit<StyledComponentProps, 'part'>> = ({
    componentType,
    ...props
}) => {
    return <StyledComponent componentType={componentType} {...props} part="input" as="input" />;
};

/**
 * A component that applies styling to a description
 */
export const StyledDescription: React.FC<Omit<StyledComponentProps, 'part'>> = ({
    componentType,
    ...props
}) => {
    return <StyledComponent componentType={componentType} {...props} part="description" />;
};

/**
 * A component that applies styling to an error message
 */
export const StyledError: React.FC<Omit<StyledComponentProps, 'part'>> = ({
    componentType,
    ...props
}) => {
    return <StyledComponent componentType={componentType} {...props} part="error" />;
};
