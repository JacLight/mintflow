import { getRandomString, niceURI, toTitleCase } from "../utils/helpers";

interface ApplyFunctionResult {
  status: string;
  message?: string;
  value: any;
}

export const applyFunction = (fn: string, value: any, rowData: any, data: any): ApplyFunctionResult => {
  if (!fn || typeof fn !== 'string') {
    console.error('Invalid function', fn);
    return { status: 'error', message: 'Invalid function', value };
  }
  try {
    const dynamicFn = new Function('value', 'rowData', 'data', fn);
    const result = dynamicFn(value, rowData, data);
    return { status: 'success', value: result };
  } catch (e) {
    console.error(e);
    return { status: 'error', message: (e as Error).message, value };
  }
};

export const applyFormTransform = (newValue: string = '', transform: string | string[]): string => {
  if (!transform) return newValue;
  const thisTransform: any = typeof transform === 'string' ? [transform] : transform;
  thisTransform.forEach((transform: string) => {
    const [type, arg] = transform.toLowerCase().split('::');
    switch (type) {
      case 'uppercase': {
        newValue = newValue.toUpperCase();
        break;
      }
      case 'lowercase': {
        newValue = newValue.toLowerCase();
        break;
      }
      case 'titlecase': {
        newValue = toTitleCase(newValue);
        break;
      }
      case 'prefix': {
        if (newValue && arg && !newValue.toLowerCase().startsWith(arg.toLowerCase())) {
          newValue = arg + newValue;
        }
        break;
      }
      case 'suffix': {
        if (newValue && arg && !newValue.toLowerCase().endsWith(arg.toLowerCase())) {
          newValue = newValue + arg;
        }
        break;
      }
      case 'random-string': {
        const newLength = (parseInt(arg, 10) || 4) * 1;
        if (newValue.length < newLength) {
          newValue = newValue + getRandomString(newLength);
        }
        break;
      }
      case 'script': {
        newValue = newValue;
        break;
      }
      case 'date-now': {
        if (!newValue) {
          newValue = new Date().toLocaleDateString();
        }
        break;
      }
      case 'time-now': {
        if (!newValue) {
          newValue = new Date().toLocaleTimeString();
        }
        break;
      }
      case 'uri': {
        newValue = niceURI(newValue);
        break;
      }
      default: {
        break;
      }
    }
  });

  return newValue;
};
