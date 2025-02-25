/**
 * Helper function to assert a value as a specific type
 * This is useful for TypeScript type checking in tests
 */
export function assertType<T>(value: any): T {
    return value as T;
}
