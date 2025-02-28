import { confluenceApiCall, confluencePaginatedApiCall } from './index.js';
import { parseStringPromise } from 'xml2js';

export interface DropdownOption {
    label: string;
    value: string;
}

export interface DropdownProps {
    disabled: boolean;
    options: DropdownOption[];
    placeholder?: string;
}

export const getSpaces = async (auth: any): Promise<DropdownProps> => {
    if (!auth) {
        return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first.',
        };
    }

    try {
        const spaces = await confluencePaginatedApiCall<{ id: string; name: string }>({
            auth,
            version: 'v2',
            method: 'GET',
            resourceUri: '/spaces',
        });

        const options: DropdownOption[] = [];
        for (const space of spaces) {
            options.push({
                label: space.name,
                value: space.id,
            });
        }
        return {
            disabled: false,
            options,
        };
    } catch (error) {
        console.error('Error fetching spaces:', error);
        return {
            disabled: true,
            options: [],
            placeholder: 'Error fetching spaces. Please check your credentials.',
        };
    }
};

export const getTemplates = async (auth: any, spaceId: string): Promise<DropdownProps> => {
    if (!auth || !spaceId) {
        return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first and select a space.',
        };
    }

    try {
        const space = await confluenceApiCall<{ id: string; name: string; key: string }>({
            auth,
            method: 'GET',
            version: 'v2',
            resourceUri: `/spaces/${spaceId}`,
        });

        const templates = await confluencePaginatedApiCall<{ templateId: string; name: string }>({
            auth,
            method: 'GET',
            version: 'v1',
            resourceUri: `/template/page`,
            query: { spaceKey: space.key },
        });

        const options: DropdownOption[] = [];
        for (const template of templates) {
            options.push({
                label: template.name,
                value: template.templateId,
            });
        }
        return {
            disabled: false,
            options,
        };
    } catch (error) {
        console.error('Error fetching templates:', error);
        return {
            disabled: true,
            options: [],
            placeholder: 'Error fetching templates. Please check your credentials.',
        };
    }
};

export const getFolders = async (auth: any, spaceId: string): Promise<DropdownProps> => {
    if (!auth || !spaceId) {
        return {
            disabled: true,
            options: [],
            placeholder: 'Please connect your account first and select a space.',
        };
    }

    try {
        const space = await confluenceApiCall<{ id: string; name: string; key: string, homepageId: string }>({
            auth,
            method: 'GET',
            version: 'v2',
            resourceUri: `/spaces/${spaceId}`,
        });

        const folders = await confluencePaginatedApiCall<{ id: string, title: string }>({
            auth,
            method: 'GET',
            version: 'v1',
            resourceUri: `/content/${space.homepageId}/descendant/folder`,
        });

        const options: DropdownOption[] = [];
        for (const folder of folders) {
            options.push({
                label: folder.title,
                value: folder.id
            });
        }
        return {
            disabled: false,
            options
        };
    } catch (error) {
        console.error('Error fetching folders:', error);
        return {
            disabled: true,
            options: [],
            placeholder: 'Error fetching folders. Please check your credentials.',
        };
    }
};

export const getTemplateVariables = async (auth: any, templateId: string): Promise<Record<string, any>> => {
    if (!auth || !templateId) {
        return {};
    }

    try {
        const response = await confluenceApiCall<{ body: { storage: { value: string } } }>({
            auth,
            method: 'GET',
            version: 'v1',
            resourceUri: `/template/${templateId}`,
        });

        const parsedXml = await parseStringPromise(response.body.storage.value, {
            explicitArray: false,
        });
        const declarations = parsedXml['at:declarations'];

        if (!declarations) return {};

        const variables: Array<{ name: string; type: string; options?: string[] }> = [];
        const props: Record<string, any> = {};

        Object.entries(declarations).forEach(([key, value]: [string, any]) => {
            const type = key.replace('at:', '');
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item['$']) {
                        const varName = item['$']['at:name'];
                        let options: string[] | undefined;

                        if (type === 'list' && item['at:option']) {
                            options = item['at:option'].map((opt: any) => opt['$']['at:value']);
                        }

                        if (varName && type) {
                            variables.push({
                                name: varName,
                                type: type,
                                options: options,
                            });
                        }
                    }
                });
            } else if (value['$']) {
                const varName = value['$']['at:name'];
                let options: string[] | undefined;

                if (type === 'list' && value['at:option']) {
                    options = value['at:option'].map((opt: any) => opt['$']['at:value']);
                }

                if (varName && type) {
                    variables.push({
                        name: varName,
                        type: type,
                        options: options,
                    });
                }
            }
        });

        for (const variable of variables) {
            switch (variable.type) {
                case 'list':
                    props[variable.name] = {
                        type: 'string',
                        enum: variable.options || [],
                        title: variable.name,
                    };
                    break;
                case 'string':
                    props[variable.name] = {
                        type: 'string',
                        title: variable.name,
                    };
                    break;
                case 'textarea':
                    props[variable.name] = {
                        type: 'string',
                        title: variable.name,
                        'x-control': 'textarea',
                    };
                    break;
                default:
                    break;
            }
        }

        return props;
    } catch (error) {
        console.error('Error fetching template variables:', error);
        return {};
    }
};
