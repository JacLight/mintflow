declare namespace jest {
    interface Matchers<R> {
        toEqual(expected: any): R;
        toHaveBeenCalledWith(...args: any[]): R;
        toThrow(expected?: string | Error | RegExp): R;
        rejects: {
            toThrow(expected?: string | Error | RegExp): Promise<R>;
        };
    }
    function mock(moduleName: string): void;
    function clearAllMocks(): void;
    type Mocked<T> = {
        [P in keyof T]: T[P] extends (...args: any[]) => any
            ? jest.MockInstance<ReturnType<T[P]>, Parameters<T[P]>>
            : T[P];
    } & T;
    interface MockInstance<T, Y extends any[]> {
        mockResolvedValueOnce(value: T): this;
        mockRejectedValueOnce(value: any): this;
    }
}

declare function describe(name: string, fn: () => void): void;
declare function beforeEach(fn: () => void): void;
declare function it(name: string, fn: () => Promise<void> | void): void;
declare function expect<T>(actual: T): jest.Matchers<void> & {
    any(constructor: any): any;
    objectContaining(obj: any): any;
};
