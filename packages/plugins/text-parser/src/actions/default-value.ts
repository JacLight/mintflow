export const defaultValue = {
    name: "default_value",
    description: "Provide a default value if the input is empty or undefined",
    inputSchema: {
        type: "object",
        properties: {
            value: {
                description: "The input value to check",
            },
            default: {
                description: "The default value to use if the input is empty or undefined"
            },
            emptyValues: {
                type: "array",
                description: "Additional values to consider as empty",
                items: {
                    type: ["string", "number", "boolean", "null"]
                },
                default: []
            },
            treatZeroAsEmpty: {
                type: "boolean",
                description: "Whether to treat 0 as an empty value",
                default: false
            },
            treatFalseAsEmpty: {
                type: "boolean",
                description: "Whether to treat false as an empty value",
                default: false
            }
        },
        required: ["default"]
    },
    outputSchema: {
        description: "The original value or the default value"
    },
    exampleInput: {
        value: "",
        default: "Default Value",
        emptyValues: ["N/A", "None"],
        treatZeroAsEmpty: false
    },
    exampleOutput: "Default Value",
    execute: async (input: any, config: any) => {
        const { value, default: defaultVal, emptyValues = [], treatZeroAsEmpty = false, treatFalseAsEmpty = false } = input.data || {};
        
        if (defaultVal === undefined) {
            return { error: "The 'default' parameter is required" };
        }
        
        // Check if the value is empty
        const isEmpty = (val: any) => {
            if (val === undefined || val === null || val === '') {
                return true;
            }
            
            if (typeof val === 'string' && val.trim() === '') {
                return true;
            }
            
            if (Array.isArray(val) && val.length === 0) {
                return true;
            }
            
            if (typeof val === 'object' && Object.keys(val).length === 0) {
                return true;
            }
            
            if (typeof val === 'number' && val === 0 && treatZeroAsEmpty) {
                return true;
            }
            
            if (typeof val === 'boolean' && val === false && treatFalseAsEmpty) {
                return true;
            }
            
            if (emptyValues.includes(val)) {
                return true;
            }
            
            return false;
        };
        
        return isEmpty(value) ? defaultVal : value;
    }
};
