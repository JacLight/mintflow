'use client';
import { AppmintTable } from 'appmint-form';
import React, { useState, useEffect } from 'react';

const data = [
    {
        id: 'key_01',
        name: 'Production API Key',
        prefix: 'sk_123456',
        secret: '••••••••••••••••',
        fullSecret: 'sk_1234567890abcdefghij',
        created: '2025-02-15T14:32:00Z',
        workspace: 'Default',
        environment: 'Production',
        lastUsed: '2025-03-28T09:47:12Z'
    },
    {
        id: 'key_02',
        name: 'Development API Key',
        prefix: 'sk_789012',
        secret: '••••••••••••••••',
        fullSecret: 'sk_7890123456abcdefghij',
        created: '2025-03-10T11:23:18Z',
        workspace: 'Claude Code',
        environment: 'Development',
        lastUsed: '2025-03-27T18:33:05Z'
    },
    {
        id: 'key_03',
        name: 'Testing API Key',
        prefix: 'sk_345678',
        secret: '••••••••••••••••',
        fullSecret: 'sk_3456789012abcdefghij',
        created: '2025-03-21T09:15:47Z',
        workspace: 'Default',
        environment: 'Development',
        lastUsed: '2025-03-28T11:22:36Z'
    }
]

const schema = {
    id: {
        type: 'string',
        title: 'ID',
        isHidden: true
    },
    name: {
        type: 'string',
        title: 'Name',
        isRequired: true
    },
    prefix: {
        type: 'string',
        title: 'Prefix'
    },
    secret: {
        type: 'string',
        title: 'Secret'
    },
    fullSecret: {
        type: 'string',
        title: 'Full Secret'
    },
    created: {
        type: 'dateTime',
        title: 'Created'
    },
    workspace: {
        type: 'string',
        title: 'Workspace'
    },
    environment: {
        type: 'string',
        title: 'Environment'
    },
    lastUsed: {
        type: 'dateTime',
        title: 'Last Used'
    }
}

const TableDemoScreen = () => {

    const onTableEvent = (event, option, selected) => {
        console.log('onTableEvent', event, option, selected);
    };
    const onRowEvent = (event: string, rowId, row) => {
        console.log('onRowEvent', event, rowId, row);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <AppmintTable data={data} schema={schema} onTableEvent={onTableEvent} onRowEvent={onRowEvent} />
        </div>
    );
};

export default TableDemoScreen;
