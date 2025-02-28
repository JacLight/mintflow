import dayjs from 'dayjs';

// Note: This is a simplified implementation for demonstration purposes
// In a real implementation, you would properly install and configure dayjs plugins

// Date format enum
export enum DateFormat {
    FORMAT_1 = 'ddd MMM DD YYYY HH:mm:ss',       // Sun Sep 17 2023 11:23:58
    FORMAT_2 = 'ddd MMM DD HH:mm:ss YYYY',       // Sun Sep 17 11:23:58 2023
    FORMAT_3 = 'MMMM DD YYYY HH:mm:ss',          // September 17 2023 11:23:58
    FORMAT_4 = 'MMMM DD YYYY',                   // September 17 2023
    FORMAT_5 = 'MMM DD YYYY',                    // Sep 17 2023
    FORMAT_6 = 'YYYY-MM-DDTHH:mm:ss',            // 2023-09-17T11:23:58
    FORMAT_7 = 'YYYY-MM-DD HH:mm:ss',            // 2023-09-17 11:23:58
    FORMAT_8 = 'YYYY-MM-DD',                     // 2023-09-17
    FORMAT_9 = 'MM-DD-YYYY',                     // 09-17-2023
    FORMAT_10 = 'MM/DD/YYYY',                    // 09/17/2023
    FORMAT_11 = 'MM/DD/YY',                      // 09/17/23
    FORMAT_12 = 'DD-MM-YYYY',                    // 17-09-2023
    FORMAT_13 = 'DD/MM/YYYY',                    // 17/09/2023
    FORMAT_14 = 'DD/MM/YY',                      // 17/09/23
    FORMAT_15 = 'X',                             // 1694949838 (Unix timestamp)
}

// Date format options for UI
export const dateFormatOptions = [
    { label: 'ddd MMM DD YYYY HH:mm:ss (Sun Sep 17 2023 11:23:58)', value: DateFormat.FORMAT_1 },
    { label: 'ddd MMM DD HH:mm:ss YYYY (Sun Sep 17 11:23:58 2023)', value: DateFormat.FORMAT_2 },
    { label: 'MMMM DD YYYY HH:mm:ss (September 17 2023 11:23:58)', value: DateFormat.FORMAT_3 },
    { label: 'MMMM DD YYYY (September 17 2023)', value: DateFormat.FORMAT_4 },
    { label: 'MMM DD YYYY (Sep 17 2023)', value: DateFormat.FORMAT_5 },
    { label: 'YYYY-MM-DDTHH:mm:ss (2023-09-17T11:23:58)', value: DateFormat.FORMAT_6 },
    { label: 'YYYY-MM-DD HH:mm:ss (2023-09-17 11:23:58)', value: DateFormat.FORMAT_7 },
    { label: 'YYYY-MM-DD (2023-09-17)', value: DateFormat.FORMAT_8 },
    { label: 'MM-DD-YYYY (09-17-2023)', value: DateFormat.FORMAT_9 },
    { label: 'MM/DD/YYYY (09/17/2023)', value: DateFormat.FORMAT_10 },
    { label: 'MM/DD/YY (09/17/23)', value: DateFormat.FORMAT_11 },
    { label: 'DD-MM-YYYY (17-09-2023)', value: DateFormat.FORMAT_12 },
    { label: 'DD/MM/YYYY (17/09/2023)', value: DateFormat.FORMAT_13 },
    { label: 'DD/MM/YY (17/09/23)', value: DateFormat.FORMAT_14 },
    { label: 'X (1694949838)', value: DateFormat.FORMAT_15 },
];

// Time units for adding/subtracting time
// These values must match dayjs's ManipulateType
export type TimeUnit =
    | 'd' | 'day' | 'days'
    | 'M' | 'month' | 'months'
    | 'y' | 'year' | 'years'
    | 'h' | 'hour' | 'hours'
    | 'm' | 'minute' | 'minutes'
    | 's' | 'second' | 'seconds'
    | 'ms' | 'millisecond' | 'milliseconds'
    | 'w' | 'week' | 'weeks'
    | 'Q' | 'quarter' | 'quarters';

// Common time unit constants
export const TimeUnits = {
    SECOND: 'second' as TimeUnit,
    MINUTE: 'minute' as TimeUnit,
    HOUR: 'hour' as TimeUnit,
    DAY: 'day' as TimeUnit,
    WEEK: 'week' as TimeUnit,
    MONTH: 'month' as TimeUnit,
    QUARTER: 'quarter' as TimeUnit,
    YEAR: 'year' as TimeUnit,
};

// Time unit options for UI
export const timeUnitOptions = [
    { label: 'Second(s)', value: TimeUnits.SECOND },
    { label: 'Minute(s)', value: TimeUnits.MINUTE },
    { label: 'Hour(s)', value: TimeUnits.HOUR },
    { label: 'Day(s)', value: TimeUnits.DAY },
    { label: 'Week(s)', value: TimeUnits.WEEK },
    { label: 'Month(s)', value: TimeUnits.MONTH },
    { label: 'Quarter(s)', value: TimeUnits.QUARTER },
    { label: 'Year(s)', value: TimeUnits.YEAR },
];

// Days of the week
export enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
}

// Day of week options for UI
export const dayOfWeekOptions = [
    { label: 'Sunday', value: DayOfWeek.SUNDAY },
    { label: 'Monday', value: DayOfWeek.MONDAY },
    { label: 'Tuesday', value: DayOfWeek.TUESDAY },
    { label: 'Wednesday', value: DayOfWeek.WEDNESDAY },
    { label: 'Thursday', value: DayOfWeek.THURSDAY },
    { label: 'Friday', value: DayOfWeek.FRIDAY },
    { label: 'Saturday', value: DayOfWeek.SATURDAY },
];

// Date parts that can be extracted
export enum DatePart {
    YEAR = 'year',
    MONTH = 'month',
    DAY = 'day',
    HOUR = 'hour',
    MINUTE = 'minute',
    SECOND = 'second',
    UNIX_TIME = 'unix_time',
    DAY_OF_WEEK = 'dayOfWeek',
    MONTH_NAME = 'monthName',
}

// Date part options for UI
export const datePartOptions = [
    { label: 'Year', value: DatePart.YEAR },
    { label: 'Month (number)', value: DatePart.MONTH },
    { label: 'Day of month', value: DatePart.DAY },
    { label: 'Hour', value: DatePart.HOUR },
    { label: 'Minute', value: DatePart.MINUTE },
    { label: 'Second', value: DatePart.SECOND },
    { label: 'Unix timestamp', value: DatePart.UNIX_TIME },
    { label: 'Day of week', value: DatePart.DAY_OF_WEEK },
    { label: 'Month name', value: DatePart.MONTH_NAME },
];

// Timezone options (simplified list)
export const timezoneOptions = [
    { label: '(GMT) UTC', value: 'UTC' },
    { label: '(GMT-08:00) America, Los Angeles', value: 'America/Los_Angeles' },
    { label: '(GMT-07:00) America, Denver', value: 'America/Denver' },
    { label: '(GMT-06:00) America, Chicago', value: 'America/Chicago' },
    { label: '(GMT-05:00) America, New York', value: 'America/New_York' },
    { label: '(GMT+00:00) Europe, London', value: 'Europe/London' },
    { label: '(GMT+01:00) Europe, Paris', value: 'Europe/Paris' },
    { label: '(GMT+02:00) Europe, Athens', value: 'Europe/Athens' },
    { label: '(GMT+03:00) Europe, Moscow', value: 'Europe/Moscow' },
    { label: '(GMT+05:30) Asia, Kolkata', value: 'Asia/Kolkata' },
    { label: '(GMT+08:00) Asia, Singapore', value: 'Asia/Singapore' },
    { label: '(GMT+09:00) Asia, Tokyo', value: 'Asia/Tokyo' },
    { label: '(GMT+10:00) Australia, Sydney', value: 'Australia/Sydney' },
];

// Simplified implementation of timezone offset (for demonstration purposes)
const getTimezoneOffset = (timezone: string): number => {
    switch (timezone) {
        case 'America/Los_Angeles': return -8 * 60;
        case 'America/Denver': return -7 * 60;
        case 'America/Chicago': return -6 * 60;
        case 'America/New_York': return -5 * 60;
        case 'Europe/London': return 0;
        case 'Europe/Paris': return 1 * 60;
        case 'Europe/Athens': return 2 * 60;
        case 'Europe/Moscow': return 3 * 60;
        case 'Asia/Kolkata': return 5.5 * 60;
        case 'Asia/Singapore': return 8 * 60;
        case 'Asia/Tokyo': return 9 * 60;
        case 'Australia/Sydney': return 10 * 60;
        default: return 0; // UTC
    }
};

// Helper function to get current date
export function getCurrentDate(format: string, timezone: string): string {
    // In a real implementation, this would use proper timezone handling
    // For demonstration, we'll just use the basic format
    return dayjs().format(format);
}

// Helper function to format a date
export function formatDate(
    inputDate: string,
    inputFormat: string,
    inputTimezone: string,
    outputFormat: string,
    outputTimezone: string
): string {
    // In a real implementation, this would use proper timezone handling
    // For demonstration, we'll just use the basic format
    return dayjs(inputDate, inputFormat).format(outputFormat);
}

// Helper function to extract date parts
export function extractDateParts(
    inputDate: string,
    inputFormat: string,
    timezone: string,
    parts: DatePart[]
): Record<DatePart, any> {
    const date = dayjs(inputDate, inputFormat);
    const result: Partial<Record<DatePart, any>> = {};

    parts.forEach(part => {
        switch (part) {
            case DatePart.YEAR:
                result[part] = date.year();
                break;
            case DatePart.MONTH:
                result[part] = date.month() + 1; // dayjs months are 0-indexed
                break;
            case DatePart.DAY:
                result[part] = date.date();
                break;
            case DatePart.HOUR:
                result[part] = date.hour();
                break;
            case DatePart.MINUTE:
                result[part] = date.minute();
                break;
            case DatePart.SECOND:
                result[part] = date.second();
                break;
            case DatePart.UNIX_TIME:
                result[part] = date.unix();
                break;
            case DatePart.DAY_OF_WEEK:
                result[part] = date.day();
                break;
            case DatePart.MONTH_NAME:
                result[part] = date.format('MMMM');
                break;
        }
    });

    return result as Record<DatePart, any>;
}

// Helper function to calculate date difference
export function dateDifference(
    date1: string,
    format1: string,
    timezone1: string,
    date2: string,
    format2: string,
    timezone2: string,
    unit: TimeUnit
): number {
    const dateObj1 = dayjs(date1, format1);
    const dateObj2 = dayjs(date2, format2);
    // Cast unit to any to avoid TypeScript errors
    return dateObj2.diff(dateObj1, unit as any);
}

// Helper function to add or subtract time from a date
export function addSubtractDate(
    inputDate: string,
    inputFormat: string,
    timezone: string,
    amount: number,
    unit: TimeUnit,
    outputFormat: string
): string {
    const date = dayjs(inputDate, inputFormat);
    // Cast unit to any to avoid TypeScript errors
    // In a real implementation, you would properly handle this with the dayjs types
    const newDate = amount >= 0
        ? date.add(amount, unit as any)
        : date.subtract(Math.abs(amount), unit as any);
    return newDate.format(outputFormat);
}

// Helper function to find the next occurrence of a day of the week
export function nextDayOfWeek(
    inputDate: string,
    inputFormat: string,
    timezone: string,
    dayOfWeek: DayOfWeek,
    outputFormat: string
): string {
    const date = dayjs(inputDate, inputFormat);
    const currentDayOfWeek = date.day();

    // Calculate days to add
    let daysToAdd = dayOfWeek - currentDayOfWeek;
    if (daysToAdd <= 0) {
        daysToAdd += 7; // Add a week if the day has already occurred this week
    }

    return date.add(daysToAdd, 'day').format(outputFormat);
}
