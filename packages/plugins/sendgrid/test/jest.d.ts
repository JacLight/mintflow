// Type definitions for Jest
declare const jest: {
  fn: () => {
    mockResolvedValue: (val: any) => void;
    mockRejectedValue: (val: any) => void;
    mockReturnValue: (val: any) => void;
    mockImplementation: (fn: any) => void;
  };
  clearAllMocks: () => void;
};

declare namespace jest {
  type Mocked<T> = any;
  type MockInstance<T, Y> = any;
  function objectContaining(obj: any): any;
}

declare function describe(name: string, fn: () => void): void;
declare function beforeEach(fn: () => void): void;
declare function it(name: string, fn: () => Promise<void> | void): void;
declare function expect(val: any): {
  toEqual: (expected: any) => void;
  toBe: (expected: any) => void;
  toHaveBeenCalledTimes: (times: number) => void;
  toHaveBeenCalledWith: (...args: any[]) => void;
  toHaveProperty: (prop: string) => void;
  toContain: (substring: string) => void;
  toBeDefined: () => void;
  not: any;
  objectContaining: (obj: any) => any;
};
