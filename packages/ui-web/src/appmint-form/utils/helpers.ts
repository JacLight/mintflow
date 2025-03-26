export const toTitleCase = (str: string) => {
    if (!str) return str;
    if (typeof str !== 'string') return str;

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

export const toSentenceCase = (str: string) => {
    if (!str || typeof str !== 'string') return str;

    // Match an uppercase letter that is followed by a lowercase letter or preceded by a lowercase letter.
    const result = str.replace(/([a-z])([A-Z])|([A-Z])([A-Z][a-z])/g, (_, p1, p2, p3, p4) => {
        return p1 && p2 ? `${p1} ${p2}` : `${p3} ${p4}`;
    });

    // Capitalize the first character and return the result
    return result.charAt(0).toUpperCase() + result.slice(1);
};

export const deepCopy = (obj: any) => {
    if (!obj) return obj;
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
};


export const deepCopySimple = (obj: any) => {
    if (!obj) return obj;
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    let clonedObj: any = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            clonedObj[key] = deepCopySimple(value);
        }
    }
    return clonedObj;
};

export const isEmpty = (obj: any) => {
    if (typeof obj === 'undefined') return true;
    if (typeof obj === null) return true;
    if (typeof obj === 'function') return false;
    if (typeof obj === 'boolean' || typeof obj === 'number') return false;
    if (typeof obj === 'string' && obj.length > 0) return false;
    if (Array.isArray(obj) && obj.length > 0) return false;
    if (obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0)
        return false;
    return true;
};

export const isNotEmpty = (obj: any) => {
    return !isEmpty(obj);
}

export const validUrl = (url: string) => {
    if (!url) return false;
    var pattern = new RegExp('^https?:\\/\\/'); // fragment locator
    return !!pattern.test(url);
};

export function getRandomNumber(min = 0, max = 999999) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomString(length = 20) {
    const chars = 'abcdefghijklmnpqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = chars + numbers;

    let result = chars.charAt(Math.floor(Math.random() * chars.length)); // Start with a character

    for (let i = 1; i < length; i++) { // Start loop from 1 since we already have the first character
        result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return result;
}

export const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
}

export function removeEmpty(obj: any): any {
    if (Array.isArray(obj)) {
        // If it's an array, apply removeEmpty to each element
        return obj.map(removeEmpty).filter(v => v != null);
    } else if (obj !== null && typeof obj === 'object') {
        // If it's an object, apply the original logic
        return Object.entries(obj)
            .filter(([_, v]) => v != null)
            .reduce(
                (acc, [k, v]) => ({ ...acc, [k]: v === Object(v) ? removeEmpty(v) : v }),
                {}
            );
    }
    // Return the value as is if it's neither an array nor an object
    return obj;
}

export const randomNumber = (length: number) => {
    var arr = [];
    while (arr.length < length) {
        var r = Math.floor(Math.random() * 100) + 1;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr.join();
};

export const isArrayString = (str: any) => {
    if (typeof str !== 'string') return false;
    return str && str.startsWith('[') && str.endsWith(']');
};

export const isObjectString = (str: any) => {
    if (typeof str !== 'string') return false;
    return str && str.startsWith('{') && str.endsWith('}');
};

export const isJsonString = (str: any) => {
    return isArrayString(str) || isObjectString(str);
};

export const niceURI = (crappyURI: any) => {
    return crappyURI?.toLowerCase().replace(/[^a-zA-Z0-9-_\/]/g, '-');
};

export function findNestedKey(obj: any, key: string | number): any {
    if (obj && typeof obj === 'object') {
        if (obj.hasOwnProperty(key)) {
            return obj[key];
        }

        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const result = findNestedKey(obj[i], key);
                if (result !== undefined) {
                    return result;
                }
            }
        } else {
            for (let prop in obj) {
                const result = findNestedKey(obj[prop], key);
                if (result !== undefined) {
                    return result;
                }
            }
        }
    }
    return undefined;
}

export function timeAgo(createdDateTime: string): string {
    const now = new Date();
    const createdDate = new Date(createdDateTime);

    const diffInSeconds = Math.abs(now.getTime() - createdDate.getTime()) / 1000;

    const days = Math.floor(diffInSeconds / (60 * 60 * 24));
    const hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(diffInSeconds % 60);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
}

export function getTimePart(date: any) {
    if (typeof date === 'string') date = new Date(date);
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = date.getMinutes();
    const amPm = hours24 < 12 ? 'AM' : 'PM';

    const formattedHours = String(hours12).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
}

export function formatTime(date: any) {
    if (typeof date === 'string') date = new Date(date);
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = date.getMinutes();
    const amPm = hours24 < 12 ? 'AM' : 'PM';

    const formattedHours = String(hours12).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
}

interface AnyObject {
    [key: string]: any;
}

export function combineObjectArray(arr1: AnyObject[], arr2: AnyObject[], uniqueKey: string): AnyObject[] {
    if (!arr1) return arr2;
    if (!arr2) return arr1;
    return Array.from(
        [...arr1, ...arr2].reduce((acc, obj) => {
            return acc.set(obj[uniqueKey], obj);
        }, new Map<any, any>()).values()
    );
}

export function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

export function stringifyCSSObject(cssObject: any, indent = '') {
    let result = '';
    for (const [key, value] of Object.entries(cssObject)) {
        if (typeof value === 'object') {
            result += `${indent}${key}: {\n${stringifyCSSObject(value, indent + '  ')}${indent}}\n`;
        } else {
            result += `${indent}${key}: ${value};\n`;
        }
    }
    return result;
}


export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
}

//camelCase to kebab-case
export const styleObjectToString = (style: { [key: string]: string }) => {
    return Object.keys(style).map(key => {
        const kebabCaseKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        return `${kebabCaseKey}:${style[key]}`;
    }
    ).join(';');
}

export const debounce = (func: any, wait: number) => {
    let timeout: any;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export const isValidHtmlId = (id: string) => {
    if (!id || typeof id !== 'string') return false;
    const idPattern = /^[A-Za-z][\w\:\-\.]*$/;
    return idPattern.test(id);
}

export const getResponseErrorMessage = e => {
    if (!e) return;
    if (e.constructor.name !== 'AxiosError') return e.message;
    let errMsg = e.response?.data?.message || e.response?.data?.error;
    let errPath = e.response?.data?.path;
    let message = errMsg + ' ' + errPath + ' ' + e.message;
    if (message.indexOf('/') > 1) {
        message = message.split('/')[0];
    }
    return message;
};