// Notion data models

export type SelectColor =
    | 'default'
    | 'gray'
    | 'brown'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'red';

export type NumberFormat =
    | 'number'
    | 'number_with_commas'
    | 'percent'
    | 'dollar'
    | 'canadian_dollar'
    | 'singapore_dollar'
    | 'euro'
    | 'pound'
    | 'yen'
    | 'ruble'
    | 'rupee'
    | 'won'
    | 'yuan'
    | 'real'
    | 'lira'
    | 'rupiah'
    | 'franc'
    | 'hong_kong_dollar'
    | 'new_zealand_dollar'
    | 'krona'
    | 'norwegian_krone'
    | 'mexican_peso'
    | 'rand'
    | 'new_taiwan_dollar'
    | 'danish_krone'
    | 'zloty'
    | 'baht'
    | 'forint'
    | 'koruna'
    | 'shekel'
    | 'chilean_peso'
    | 'philippine_peso'
    | 'dirham'
    | 'colombian_peso'
    | 'riyal'
    | 'ringgit'
    | 'leu'
    | 'argentine_peso'
    | 'uruguayan_peso'
    | 'peruvian_sol';

export type RollupFunction =
    | 'count'
    | 'count_values'
    | 'empty'
    | 'not_empty'
    | 'unique'
    | 'show_unique'
    | 'percent_empty'
    | 'percent_not_empty'
    | 'sum'
    | 'average'
    | 'median'
    | 'min'
    | 'max'
    | 'range'
    | 'earliest_date'
    | 'latest_date'
    | 'date_range'
    | 'checked'
    | 'unchecked'
    | 'percent_checked'
    | 'percent_unchecked'
    | 'count_per_group'
    | 'percent_per_group'
    | 'show_original';

export interface NotionDatabase {
    object: 'database';
    id: string;
    created_time: string;
    created_by: {
        object: 'user';
        id: string;
    };
    last_edited_time: string;
    last_edited_by: {
        object: 'user';
        id: string;
    };
    is_inline: boolean;
    archived: boolean;
    url: string;
    public_url: string | null;
    cover:
    | {
        type: 'external';
        external: {
            url: string;
        };
    }
    | null
    | {
        type: 'file';
        file: {
            url: string;
            expiry_time: string;
        };
    }
    | null;
    properties: Record<string, DatabaseProperty>;
    parent:
    | {
        type: 'database_id';
        database_id: string;
    }
    | {
        type: 'page_id';
        page_id: string;
    }
    | {
        type: 'block_id';
        block_id: string;
    }
    | {
        type: 'workspace';
        workspace: true;
    };
}

export interface NotionPage {
    object: 'page';
    id: string;
    created_time: string;
    created_by: {
        object: 'user';
        id: string;
    };
    last_edited_time: string;
    last_edited_by: {
        object: 'user';
        id: string;
    };
    archived: boolean;
    url: string;
    public_url: string | null;
    properties: Record<string, any>;
    parent:
    | {
        type: 'database_id';
        database_id: string;
    }
    | {
        type: 'page_id';
        page_id: string;
    }
    | {
        type: 'block_id';
        block_id: string;
    }
    | {
        type: 'workspace';
        workspace: true;
    };
}

export interface NotionBlock {
    object: 'block';
    id: string;
    created_time: string;
    created_by: {
        object: 'user';
        id: string;
    };
    last_edited_time: string;
    last_edited_by: {
        object: 'user';
        id: string;
    };
    has_children: boolean;
    archived: boolean;
    type: string;
    [key: string]: any;
}

export interface NotionUser {
    object: 'user';
    id: string;
    name: string;
    avatar_url: string | null;
    type: 'person' | 'bot';
    person?: {
        email: string;
    };
    bot?: {
        owner: {
            type: 'user' | 'workspace';
            workspace?: boolean;
            user?: {
                object: 'user';
                id: string;
            };
        };
    };
}

// Database property types
export type DateDatabaseProperty = {
    id: string;
    name: string;
    type: 'date';
    date: Record<string, never>;
};

export type CheckboxDatabaseProperty = {
    id: string;
    name: string;
    type: 'checkbox';
    checkbox: Record<string, never>;
};

export type CreatedByDatabaseProperty = {
    id: string;
    name: string;
    type: 'created_by';
};

export type CreatedTimeDatabaseProperty = {
    id: string;
    name: string;
    type: 'created_time';
    created_time: Record<string, never>;
};

export type EmailDatabaseProperty = {
    id: string;
    name: string;
    type: 'email';
    email: Record<string, never>;
};

export type FilesDatabaseProperty = {
    id: string;
    name: string;
    type: 'files';
    files: Record<string, never>;
};

export type FormulaDatabaseProperty = {
    id: string;
    name: string;
    type: 'formula';
    formula: {
        expression: string;
    };
};

export type LastEditedByDatabaseProperty = {
    id: string;
    name: string;
    type: 'last_edited_by';
    last_edited_by: Record<string, never>;
};

export type LastEditedTimeDatabaseProperty = {
    id: string;
    name: string;
    type: 'last_edited_time';
    last_edited_time: Record<string, never>;
};

export type MultiSelectDatabaseProperty = {
    id: string;
    name: string;
    type: 'multi_select';
    multi_select: {
        options: {
            id: string;
            name: string;
            color: SelectColor;
        }[];
    };
};

export type NumberDatabaseProperty = {
    id: string;
    name: string;
    type: 'number';
    number: {
        format: NumberFormat;
    };
};

export type PeopleDatabaseProperty = {
    id: string;
    name: string;
    type: 'people';
    people: Record<string, never>;
};

export type PhoneNumberDatabaseProperty = {
    id: string;
    name: string;
    type: 'phone_number';
    phone_number: Record<string, never>;
};

export type RelationDatabaseProperty = {
    id: string;
    name: string;
    type: 'relation';
    relation: {
        database_id: string;
        synced_property_id: string;
        synced_property_name: string;
    };
};

export type RichTextDatabaseProperty = {
    id: string;
    name: string;
    type: 'rich_text';
    rich_text: Record<string, never>;
};

export type RollupDatabaseProperty = {
    type: 'rollup';
    rollup: {
        rollup_property_name: string;
        relation_property_name: string;
        rollup_property_id: string;
        relation_property_id: string;
        function: RollupFunction;
    };
    id: string;
    name: string;
};

export type SelectDatabaseProperty = {
    id: string;
    name: string;
    type: 'select';
    select: {
        options: {
            id: string;
            name: string;
            color: SelectColor;
        }[];
    };
};

export type StatusDatabaseProperty = {
    id: string;
    name: string;
    type: 'status';
    status: {
        options: {
            id: string;
            name: string;
            color: SelectColor;
        }[];
        groups: {
            id: string;
            name: string;
            color: SelectColor;
            option_ids: Array<string>;
        };
    };
};

export type TitleDatabaseProperty = {
    type: 'title';
    title: Record<string, never>;
    id: string;
    name: string;
};

export type UrlDatabaseProperty = {
    type: 'url';
    url: Record<string, never>;
    id: string;
    name: string;
};

export type DatabaseProperty =
    | NumberDatabaseProperty
    | FormulaDatabaseProperty
    | SelectDatabaseProperty
    | MultiSelectDatabaseProperty
    | StatusDatabaseProperty
    | RelationDatabaseProperty
    | RollupDatabaseProperty
    | TitleDatabaseProperty
    | RichTextDatabaseProperty
    | UrlDatabaseProperty
    | PeopleDatabaseProperty
    | FilesDatabaseProperty
    | EmailDatabaseProperty
    | PhoneNumberDatabaseProperty
    | DateDatabaseProperty
    | CheckboxDatabaseProperty
    | CreatedByDatabaseProperty
    | CreatedTimeDatabaseProperty
    | LastEditedByDatabaseProperty
    | LastEditedTimeDatabaseProperty;

export interface NotionCreateDatabaseItemParams {
    token: string;
    databaseId: string;
    properties: Record<string, any>;
    content?: string;
}

export interface NotionUpdateDatabaseItemParams {
    token: string;
    databaseId: string;
    pageId: string;
    properties: Record<string, any>;
}

export interface NotionFindDatabaseItemParams {
    token: string;
    databaseId: string;
    filter?: Record<string, any>;
    sorts?: Array<{
        property?: string;
        timestamp?: string;
        direction: 'ascending' | 'descending';
    }>;
    pageSize?: number;
}

export interface NotionCreatePageParams {
    token: string;
    parentId: string;
    parentType: 'database_id' | 'page_id';
    title: string;
    content?: string;
    icon?: string;
    cover?: string;
}

export interface NotionAppendToPageParams {
    token: string;
    pageId: string;
    content: string;
}

export interface NotionGetChildrenParams {
    token: string;
    blockId: string;
    pageSize?: number;
    startCursor?: string;
}

export interface NotionFieldMapping {
    [key: string]: {
        buildNotionType: (value: any) => any;
    };
}
