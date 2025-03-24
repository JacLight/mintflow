declare module 'zod' {
  export const z: {
    string: () => any;
    number: () => any;
    boolean: () => any;
    array: (schema: any) => any;
    object: (schema: Record<string, any>) => any;
    record: (keyType: any, valueType: any) => any;
    any: () => any;
  };
  
  export function string(): any;
  export function number(): any;
  export function boolean(): any;
  export function array(schema: any): any;
  export function object(schema: Record<string, any>): any;
  export function record(keyType: any, valueType: any): any;
  export function any(): any;
  export function optional(): any;
}
