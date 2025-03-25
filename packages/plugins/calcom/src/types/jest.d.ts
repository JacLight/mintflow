declare global {
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void) => void;
  const expect: (actual: any) => any;
  const beforeEach: (fn: () => void) => void;
}

export {};
