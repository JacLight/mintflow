import { commonSchema } from "../common.js";


export const map = {
    name: "map",
    ...commonSchema,
    inputSchema: {
        /* your schema as before */
    },
    description: "Maps an array of objects using a custom JS pattern",
    execute: async (input: any, config: any) => {
        const { array, max, mappings } = input;
        // If max=0 => no limit, else limit to max or entire array length
        const limit = max === 0 ? array.length : max || array.length;

        if (!Array.isArray(array)) {
            return [];
        }
        if (!Array.isArray(mappings)) {
            return array;
        }

        /**
         * Evaluate a single JS expression with `with(row) { return expr }`.
         * Returns the typed result if valid, or `undefined` on error.
         */
        function evaluateExpression(row: any, expr: string) {
            try {
                const func = new Function("row", `with (row) { return ${expr} }`);
                return func(row); // e.g. number, string, boolean, etc.
            } catch {
                // If invalid reference (e.g. {{invalid}}) or syntax error
                return undefined;
            }
        }

        /**
         * Apply the pattern to a single row.
         * - If pattern is exactly `{{someExpr}}`, return typed value.
         * - Else, replace each `{{expr}}` inside the string with its evaluated value,
         *   and produce a final string.
         */
        function applyPattern(row: any, pattern: string) {
            const trimmed = pattern.trim();

            // Quick checks: does it start with {{ and end with }}?
            if (
                trimmed.startsWith('{{') &&
                trimmed.endsWith('}}') &&
                // Ensure there's no extra {{ or }} in the middle
                trimmed.indexOf('{{', 2) === -1 &&
                trimmed.lastIndexOf('}}') === trimmed.length - 2
            ) {
                // It's exactly one expression, e.g. "{{a * 2}}"
                const expr = trimmed.slice(2, -2).trim();
                return evaluateExpression(row, expr);
            }

            // Otherwise, do partial expansions => final is a string
            return trimmed.replace(/{{(.*?)}}/g, (_, expr) => {
                const val = evaluateExpression(row, expr.trim());
                // For partial expansions, we typically coerce each piece to string
                return val == null ? '' : String(val);
            });
        }

        // Map over the array (limited by `max`)
        const result = array.slice(0, limit).map((item: any) => {
            const newItem: Record<string, any> = {};

            mappings.forEach((mapping: any) => {
                const { newField, pattern } = mapping;
                if (!pattern) {
                    newItem[newField] = undefined;
                    return;
                }
                newItem[newField] = applyPattern(item, pattern);
            });

            return newItem;
        });

        return result;
    },
};

export default map;
