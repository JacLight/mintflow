'use client';

export const localStorageUtils = {
    set: (name: string, value: any) => {
        if (typeof localStorage === 'undefined') return;
        if (value instanceof Object) {
            value = JSON.stringify(value);
        }
        localStorage.setItem(name, value);
    },
    get: (name: string): any => {
        if (typeof localStorage === 'undefined') return;
        let value = localStorage.getItem(name);
        if (value === null) return null;

        try {
            // Only try to parse if it looks like JSON (starts with { or [)
            if (value && (value.startsWith('{') || value.startsWith('['))) {
                return JSON.parse(value);
            }
        } catch (e) {
            // If parsing fails, just return the original string value
            console.warn(`Failed to parse localStorage value for key "${name}"`, e);
        }

        // Return the original value if it's not JSON or parsing failed
        return value;
    },
    remove: (name: string) => {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(name);
    },

    clear: () => {
        if (typeof localStorage === 'undefined') return;
        localStorage.clear();
    }
}
