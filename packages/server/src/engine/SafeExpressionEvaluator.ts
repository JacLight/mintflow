// src/utils/SafeExpressionEvaluator.ts

import { logger } from '@mintflow/common';

export class SafeExpressionEvaluator {
    private static readonly ALLOWED_OPERATORS = [
        '+', '-', '*', '/', '%',
        '==', '===', '!=', '!==',
        '>', '<', '>=', '<=',
        '&&', '||', '!',
        '?', ':'
    ];

    private static readonly ALLOWED_FUNCTIONS = [
        'Number', 'String', 'Boolean',
        'parseInt', 'parseFloat',
        'Math.min', 'Math.max', 'Math.round', 'Math.floor', 'Math.ceil',
        'isNaN', 'isFinite'
    ];

    static async evaluate(expression: string, context: Record<string, any>): Promise<boolean> {
        try {
            // Validate expression
            this.validateExpression(expression);

            // Create a safe context with only allowed globals
            const safeContext = {
                ...this.createSafeContext(),
                ...context
            };

            // Create the function with a secure context
            const evaluator = new Function(
                ...Object.keys(safeContext),
                `"use strict"; return (${expression});`
            );

            // Execute with the safe context values
            const result = evaluator(...Object.values(safeContext));

            return Boolean(result);
        } catch (error: any) {
            logger.error('Expression evaluation error', {
                expression,
                error: error.message
            });
            return false;
        }
    }

    private static validateExpression(expression: string): void {
        // Check for potentially dangerous constructs
        const dangerousPatterns = [
            'eval', 'Function', 'constructor',
            'prototype', '__proto__',
            'window', 'document', 'global',
            'process', 'require', 'module',
            'setTimeout', 'setInterval',
            'fetch', 'XMLHttpRequest'
        ];

        for (const pattern of dangerousPatterns) {
            if (expression.includes(pattern)) {
                throw new Error(`Invalid expression: contains forbidden term '${pattern}'`);
            }
        }

        // Additional security checks can be added here
        // For example, validating against a whitelist of allowed operations
    }

    private static createSafeContext(): Record<string, any> {
        return {
            // Safe Math operations
            Math: {
                min: Math.min,
                max: Math.max,
                round: Math.round,
                floor: Math.floor,
                ceil: Math.ceil
            },

            // Safe type conversion
            Number: Number,
            String: String,
            Boolean: Boolean,
            parseInt: parseInt,
            parseFloat: parseFloat,

            // Safe checks
            isNaN: isNaN,
            isFinite: isFinite,

            // Utility functions
            hasOwnProperty: (obj: any, prop: string) =>
                Object.prototype.hasOwnProperty.call(obj, prop),

            isArray: Array.isArray,

            // Add any other safe functions here
        };
    }

    static validateSafeFunction(functionName: string): boolean {
        return this.ALLOWED_FUNCTIONS.includes(functionName);
    }

    static validateSafeOperator(operator: string): boolean {
        return this.ALLOWED_OPERATORS.includes(operator);
    }
}