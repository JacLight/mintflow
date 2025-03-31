import dataBridgePlugin from '../src/index';
import { DateFormat, TimeUnits, DayOfWeek, DatePart } from '../src/date-utils';
import dayjs from 'dayjs';

describe('dataBridgePlugin', () => {
    describe('advanced_mapping action', () => {
        it('should map data using object mapping', async () => {
            const input = {
                data: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    address: {
                        street: '123 Main St',
                        city: 'Anytown',
                        zipCode: '12345'
                    }
                }
            };

            const config = {
                data: {
                    mapping: {
                        name: 'firstName',
                        surname: 'lastName',
                        contactEmail: 'email',
                        streetAddress: 'address.street',
                        location: 'address.city',
                        zip: 'address.zipCode'
                    }
                }
            };

            const result = await dataBridgePlugin.actions[0].execute(input, config);

            expect(result).toEqual({
                name: 'John',
                surname: 'Doe',
                contactEmail: 'john.doe@example.com',
                streetAddress: '123 Main St',
                location: 'Anytown',
                zip: '12345'
            });
        });

        it('should handle missing properties gracefully', async () => {
            const input = {
                data: {
                    firstName: 'John',
                    lastName: 'Doe'
                }
            };

            const config = {
                data: {
                    mapping: {
                        name: 'firstName',
                        surname: 'lastName',
                        contactEmail: 'email',
                        streetAddress: 'address.street'
                    }
                }
            };

            const result = await dataBridgePlugin.actions[0].execute(input, config);

            expect(result).toEqual({
                name: 'John',
                surname: 'Doe',
                contactEmail: undefined,
                streetAddress: undefined
            });
        });

        it('should return original data if mapping is not provided', async () => {
            const input = {
                data: {
                    firstName: 'John',
                    lastName: 'Doe'
                }
            };

            const config = {
                data: {}
            };

            const result = await dataBridgePlugin.actions[0].execute(input, config);

            expect(result).toEqual(input.data);
        });
    });

    describe('transform_array action', () => {
        it('should transform array items using mapping', async () => {
            const input = {
                data: {
                    users: [
                        {
                            id: 1,
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john@example.com'
                        },
                        {
                            id: 2,
                            firstName: 'Jane',
                            lastName: 'Smith',
                            email: 'jane@example.com'
                        }
                    ]
                }
            };

            const config = {
                data: {
                    sourceArray: 'users',
                    mapping: {
                        userId: 'id',
                        name: 'firstName',
                        surname: 'lastName',
                        contactEmail: 'email'
                    }
                }
            };

            const result = await dataBridgePlugin.actions[1].execute(input, config);

            expect(result).toEqual({
                transformedArray: [
                    {
                        userId: 1,
                        name: 'John',
                        surname: 'Doe',
                        contactEmail: 'john@example.com'
                    },
                    {
                        userId: 2,
                        name: 'Jane',
                        surname: 'Smith',
                        contactEmail: 'jane@example.com'
                    }
                ]
            });
        });

        it('should return error if source is not an array', async () => {
            const input = {
                data: {
                    user: {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe'
                    }
                }
            };

            const config = {
                data: {
                    sourceArray: 'user',
                    mapping: {
                        userId: 'id',
                        name: 'firstName',
                        surname: 'lastName'
                    }
                }
            };

            const result = await dataBridgePlugin.actions[1].execute(input, config);

            expect(result).toEqual({
                error: 'Source is not an array'
            });
        });
    });

    // Tests for date-related functionality
    describe('get_current_date action', () => {
        it('should return the current date in the specified format', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    outputFormat: DateFormat.FORMAT_8, // YYYY-MM-DD
                    outputTimezone: 'UTC'
                }
            };

            const result = await dataBridgePlugin.actions[2].execute(input, config);

            // Check that the result contains a currentDate property with the correct format
            expect(result).toHaveProperty('currentDate');
            expect(typeof result.currentDate).toBe('string');

            // Verify the format is YYYY-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            expect(dateRegex.test(result.currentDate)).toBe(true);
        });
    });

    describe('format_date action', () => {
        it('should format a date from one format to another', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    inputDate: '2025-02-27',
                    inputFormat: DateFormat.FORMAT_8, // YYYY-MM-DD
                    inputTimezone: 'UTC',
                    outputFormat: DateFormat.FORMAT_10, // MM/DD/YYYY
                    outputTimezone: 'UTC'
                }
            };

            const result = await dataBridgePlugin.actions[3].execute(input, config);

            expect(result).toHaveProperty('formattedDate');
            expect(result.formattedDate).toBe('02/27/2025');
        });

        it('should return error if input date is not provided', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    inputFormat: DateFormat.FORMAT_8,
                    outputFormat: DateFormat.FORMAT_10
                }
            };

            const result = await dataBridgePlugin.actions[3].execute(input, config);

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Input date is required');
        });
    });

    describe('extract_date_parts action', () => {
        it('should extract specified parts from a date', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    inputDate: '2025-02-27',
                    inputFormat: DateFormat.FORMAT_8, // YYYY-MM-DD
                    inputTimezone: 'UTC',
                    dateParts: [
                        DatePart.YEAR,
                        DatePart.MONTH,
                        DatePart.DAY
                    ]
                }
            };

            const result = await dataBridgePlugin.actions[4].execute(input, config);

            expect(result).toHaveProperty('dateParts');
            expect(result.dateParts).toEqual({
                [DatePart.YEAR]: 2025,
                [DatePart.MONTH]: 2,
                [DatePart.DAY]: 27
            });
        });
    });

    describe('date_difference action', () => {
        it('should calculate the difference between two dates', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    date1: '2025-01-01',
                    format1: DateFormat.FORMAT_8, // YYYY-MM-DD
                    timezone1: 'UTC',
                    date2: '2025-01-31',
                    format2: DateFormat.FORMAT_8, // YYYY-MM-DD
                    timezone2: 'UTC',
                    unit: TimeUnits.DAY
                }
            };

            const result = await dataBridgePlugin.actions[5].execute(input, config);

            expect(result).toHaveProperty('difference');
            expect(result.difference).toBe(30); // 30 days difference
        });

        it('should return error if dates are not provided', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    unit: TimeUnits.DAY
                }
            };

            const result = await dataBridgePlugin.actions[5].execute(input, config);

            expect(result).toHaveProperty('error');
            expect(result.error).toBe('Both dates are required');
        });
    });

    describe('add_subtract_date action', () => {
        it('should add time to a date', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    inputDate: '2025-01-01',
                    inputFormat: DateFormat.FORMAT_8, // YYYY-MM-DD
                    inputTimezone: 'UTC',
                    amount: 7,
                    unit: TimeUnits.DAY,
                    outputFormat: DateFormat.FORMAT_8 // YYYY-MM-DD
                }
            };

            const result = await dataBridgePlugin.actions[6].execute(input, config);

            expect(result).toHaveProperty('resultDate');
            expect(result.resultDate).toBe('2025-01-08');
        });

        it('should subtract time from a date', async () => {
            const input = { data: {} };
            const config = {
                data: {
                    inputDate: '2025-01-15',
                    inputFormat: DateFormat.FORMAT_8, // YYYY-MM-DD
                    inputTimezone: 'UTC',
                    amount: -5,
                    unit: TimeUnits.DAY,
                    outputFormat: DateFormat.FORMAT_8 // YYYY-MM-DD
                }
            };

            const result = await dataBridgePlugin.actions[6].execute(input, config);

            expect(result).toHaveProperty('resultDate');
            expect(result.resultDate).toBe('2025-01-10');
        });
    });

    describe('next_day_of_week action', () => {
        it('should find the next occurrence of a specific day of the week', async () => {
            // January 1, 2025 is a Wednesday (day 3)
            const input = { data: {} };
            const config = {
                data: {
                    inputDate: '2025-01-01',
                    inputFormat: DateFormat.FORMAT_8, // YYYY-MM-DD
                    inputTimezone: 'UTC',
                    dayOfWeek: DayOfWeek.MONDAY, // Next Monday
                    outputFormat: DateFormat.FORMAT_8 // YYYY-MM-DD
                }
            };

            const result = await dataBridgePlugin.actions[7].execute(input, config);

            expect(result).toHaveProperty('nextDate');
            expect(result.nextDate).toBe('2025-01-06'); // Next Monday is January 6
        });
    });
});
