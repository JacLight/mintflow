import { activeSession } from "../active-session";
import { createNewBaseData, createNewData } from "./base.model";

export const MintflowSchema = () => {
    return {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                pattern: '^[a-zA-Z_\\-0-9]*$',
                minLength: 3,
                maxLength: 50,
                unique: true,
                transform: 'uri',
                group: 'name',
                displayStyle: 'outlined',
            },
            title: {
                type: 'string',
                displayStyle: 'outlined',
                group: 'name'
            },
            layoutFlow: {
                type: 'string',
                enum: ['vertical', 'horizontal'],
                displayStyle: 'outlined',
                default: 'vertical',
                group: 'flow'
            },
            executionFlow: {
                type: 'string',
                enum: ['auto', 'flow', 'step'],
                displayStyle: 'outlined',
                default: 'auto',
                group: 'flow'
            },
            description: {
                displayStyle: 'outlined',
                type: 'string',
                'x-control-variant': 'textarea',
            },
            instances: {
                type: 'number',
                maximum: 10,
                minimum: 0,
                hidden: true,
            },
            flow: {
                type: 'object'
            },
            status: {
                type: 'string',
                enum: ['draft', 'published', 'archived'],
                default: 'Draft',
                readOnly: true,
            }
        },
    } as const;
};

export const createNewFlowBaseData = (name: string, title: string, description: string, author = activeSession.getUser()?.data?.email) => {
    return createNewBaseData('mintflow', { name, title, description }, undefined, author);
}