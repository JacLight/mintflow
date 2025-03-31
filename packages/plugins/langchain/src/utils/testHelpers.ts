/**
 * Test helper utilities for type assertions
 */

/**
 * Helper function to assert a value as a specific type
 * This is useful in tests where TypeScript can't infer the correct type
 * 
 * @param value The value to assert
 * @returns The same value but with the specified type
 */
export function assertType<T>(value: any): T {
    return value as T;
}
