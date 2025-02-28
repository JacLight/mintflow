import {
    DateFormat,
    TimeUnit,
    TimeUnits,
    DayOfWeek,
    DatePart,
    dateFormatOptions,
    timeUnitOptions,
    dayOfWeekOptions,
    datePartOptions,
    timezoneOptions,
    getCurrentDate,
    formatDate,
    extractDateParts,
    dateDifference,
    addSubtractDate,
    nextDayOfWeek
} from './date-utils.js';

interface Mapping {
    [key: string]: string | object | null;
}

interface DataBridgeConfig {
    data?: {
        mapping?: Mapping | string;
        sourceArray?: string;
        // Date-related properties
        inputDate?: string;
        inputFormat?: string;
        inputTimezone?: string;
        outputFormat?: string;
        outputTimezone?: string;
        dateParts?: DatePart[];
        date1?: string;
        format1?: string;
        timezone1?: string;
        date2?: string;
        format2?: string;
        timezone2?: string;
        unit?: TimeUnit;
        amount?: number;
        dayOfWeek?: DayOfWeek;
    };
}

interface DataInput {
    data?: Record<string, any>;
}

const dataBridgePlugin = {
    name: "Data Bridge",
    icon: "",
    description: "Tools to transform and map data structures",
    id: "data-bridge",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            mapping: {
                type: "object",
                description: "The mapping to use for transforming data",
                required: true
            }
        }
    },
    outputSchema: {
        type: "object"
    },
    method: "exec",
    actions: [
        {
            name: 'advanced_mapping',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};

                // If mapping is not provided, return the original data
                if (!config.data?.mapping) {
                    return data;
                }

                const mapping = config.data.mapping;

                // If mapping is a function, execute it with the data
                if (typeof mapping === 'string' && mapping.startsWith('function')) {
                    try {
                        // Create a safe function from the string
                        const mapFn = new Function('data', `
                            return (${mapping})(data);
                        `);

                        // Execute the function with the data
                        return mapFn(data);
                    } catch (error) {
                        console.error('Error executing mapping function:', error);
                        return { error: 'Failed to execute mapping function' };
                    }
                }

                // If mapping is an object, use it as a template
                if (typeof mapping === 'object') {
                    const result: Record<string, any> = {};

                    // Process each key in the mapping
                    for (const [newKey, oldKey] of Object.entries(mapping)) {
                        if (typeof oldKey === 'string') {
                            // Handle dot notation for nested properties
                            if (oldKey.includes('.')) {
                                const keys = oldKey.split('.');
                                let value = data;

                                // Navigate through the nested properties
                                for (const key of keys) {
                                    if (value && typeof value === 'object') {
                                        value = value[key];
                                    } else {
                                        value = undefined;
                                        break;
                                    }
                                }

                                result[newKey] = value;
                            } else {
                                // Direct property mapping
                                result[newKey] = data[oldKey];
                            }
                        } else if (typeof oldKey === 'object' && oldKey !== null) {
                            // Nested mapping
                            result[newKey] = oldKey;
                        }
                    }

                    return result;
                }

                // If mapping is neither a function nor an object, return the original data
                // Make sure to return the original input data, not an empty object
                return input.data;
            }
        },
        {
            name: 'transform_array',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const sourceArray = data[config.data?.sourceArray] || [];
                const mapping = config.data?.mapping || {};

                if (!Array.isArray(sourceArray)) {
                    return { error: 'Source is not an array' };
                }

                try {
                    // Map each item in the array using the mapping
                    const transformedArray = sourceArray.map(item => {
                        const result: Record<string, any> = {};

                        // Process each key in the mapping
                        for (const [newKey, oldKey] of Object.entries(mapping)) {
                            if (typeof oldKey === 'string') {
                                // Handle dot notation for nested properties
                                if (oldKey.includes('.')) {
                                    const keys = oldKey.split('.');
                                    let value = item;

                                    // Navigate through the nested properties
                                    for (const key of keys) {
                                        if (value && typeof value === 'object') {
                                            value = value[key];
                                        } else {
                                            value = undefined;
                                            break;
                                        }
                                    }

                                    result[newKey] = value;
                                } else {
                                    // Direct property mapping
                                    result[newKey] = item[oldKey];
                                }
                            } else if (typeof oldKey === 'object' && oldKey !== null) {
                                // Nested mapping
                                result[newKey] = oldKey;
                            }
                        }

                        return result;
                    });

                    return { transformedArray };
                } catch (error) {
                    console.error('Error transforming array:', error);
                    return { error: 'Failed to transform array' };
                }
            }
        },
        {
            name: 'get_current_date',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const outputFormat = config.data?.outputFormat || DateFormat.FORMAT_7;
                const timezone = config.data?.outputTimezone || 'UTC';

                try {
                    const currentDate = getCurrentDate(outputFormat, timezone);
                    return {
                        ...data,
                        currentDate
                    };
                } catch (error) {
                    console.error('Error getting current date:', error);
                    return { error: 'Failed to get current date' };
                }
            }
        },
        {
            name: 'format_date',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const inputDate = config.data?.inputDate || '';
                const inputFormat = config.data?.inputFormat || DateFormat.FORMAT_7;
                const inputTimezone = config.data?.inputTimezone || 'UTC';
                const outputFormat = config.data?.outputFormat || DateFormat.FORMAT_7;
                const outputTimezone = config.data?.outputTimezone || 'UTC';

                if (!inputDate) {
                    return { error: 'Input date is required' };
                }

                try {
                    const formattedDate = formatDate(
                        inputDate,
                        inputFormat,
                        inputTimezone,
                        outputFormat,
                        outputTimezone
                    );
                    return {
                        ...data,
                        formattedDate
                    };
                } catch (error) {
                    console.error('Error formatting date:', error);
                    return { error: 'Failed to format date' };
                }
            }
        },
        {
            name: 'extract_date_parts',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const inputDate = config.data?.inputDate || '';
                const inputFormat = config.data?.inputFormat || DateFormat.FORMAT_7;
                const timezone = config.data?.inputTimezone || 'UTC';
                const parts = config.data?.dateParts || [
                    DatePart.YEAR,
                    DatePart.MONTH,
                    DatePart.DAY,
                    DatePart.HOUR,
                    DatePart.MINUTE,
                    DatePart.SECOND
                ];

                if (!inputDate) {
                    return { error: 'Input date is required' };
                }

                try {
                    const dateParts = extractDateParts(inputDate, inputFormat, timezone, parts);
                    return {
                        ...data,
                        dateParts
                    };
                } catch (error) {
                    console.error('Error extracting date parts:', error);
                    return { error: 'Failed to extract date parts' };
                }
            }
        },
        {
            name: 'date_difference',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const date1 = config.data?.date1 || '';
                const format1 = config.data?.format1 || DateFormat.FORMAT_7;
                const timezone1 = config.data?.timezone1 || 'UTC';
                const date2 = config.data?.date2 || '';
                const format2 = config.data?.format2 || DateFormat.FORMAT_7;
                const timezone2 = config.data?.timezone2 || 'UTC';
                const unit = config.data?.unit || TimeUnits.DAY;

                if (!date1 || !date2) {
                    return { error: 'Both dates are required' };
                }

                try {
                    const difference = dateDifference(
                        date1,
                        format1,
                        timezone1,
                        date2,
                        format2,
                        timezone2,
                        unit
                    );
                    return {
                        ...data,
                        difference,
                        unit
                    };
                } catch (error) {
                    console.error('Error calculating date difference:', error);
                    return { error: 'Failed to calculate date difference' };
                }
            }
        },
        {
            name: 'add_subtract_date',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const inputDate = config.data?.inputDate || '';
                const inputFormat = config.data?.inputFormat || DateFormat.FORMAT_7;
                const timezone = config.data?.inputTimezone || 'UTC';
                const amount = config.data?.amount || 0;
                const unit = config.data?.unit || TimeUnits.DAY;
                const outputFormat = config.data?.outputFormat || DateFormat.FORMAT_7;

                if (!inputDate) {
                    return { error: 'Input date is required' };
                }

                try {
                    const resultDate = addSubtractDate(
                        inputDate,
                        inputFormat,
                        timezone,
                        amount,
                        unit,
                        outputFormat
                    );
                    return {
                        ...data,
                        resultDate
                    };
                } catch (error) {
                    console.error('Error adding/subtracting date:', error);
                    return { error: 'Failed to add/subtract date' };
                }
            }
        },
        {
            name: 'next_day_of_week',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const inputDate = config.data?.inputDate || '';
                const inputFormat = config.data?.inputFormat || DateFormat.FORMAT_7;
                const timezone = config.data?.inputTimezone || 'UTC';
                const dayOfWeek = config.data?.dayOfWeek || DayOfWeek.MONDAY;
                const outputFormat = config.data?.outputFormat || DateFormat.FORMAT_7;

                if (!inputDate) {
                    return { error: 'Input date is required' };
                }

                try {
                    const nextDate = nextDayOfWeek(
                        inputDate,
                        inputFormat,
                        timezone,
                        dayOfWeek,
                        outputFormat
                    );
                    return {
                        ...data,
                        nextDate
                    };
                } catch (error) {
                    console.error('Error finding next day of week:', error);
                    return { error: 'Failed to find next day of week' };
                }
            }
        }
    ]
};

export default dataBridgePlugin;
