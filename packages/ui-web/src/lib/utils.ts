/**
 * Utility functions for the UI
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with tailwind
 * @param inputs Class names to merge
 * @returns Merged class names
 */
export function classNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a UUID
 * @returns A UUID string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format a date
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a number
 * @param num The number to format
 * @returns A formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Truncate a string
 * @param str The string to truncate
 * @param length The maximum length
 * @returns A truncated string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
}

/**
 * Deep copy an object
 * @param obj The object to copy
 * @returns A deep copy of the object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a random number between min and max (inclusive)
 * @param min The minimum value
 * @param max The maximum value
 * @returns A random number between min and max
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add a global declaration for loadPyodide
declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<any>;
  }
  
  var loadPyodide: (options: { indexURL: string }) => Promise<any>;
}
