import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes properly.
 * @param inputs Class names to combine
 * @returns Merged class names string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
