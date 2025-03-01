// This file contains global type declarations for testing purposes

declare global {
    // Jest globals
    const describe: (name: string, fn: () => void) => void;
    const beforeEach: (fn: () => void) => void;
    const afterEach: (fn: () => void) => void;
    const it: (name: string, fn: () => void) => void;
    const expect: any;
    const jest: {
        fn: () => any;
        mock: (moduleName: string, factory?: () => any) => void;
        clearAllMocks: () => void;
    };
}

export { };
