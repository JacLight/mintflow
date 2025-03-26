import React, { HTMLProps } from 'react';
import { toSentenceCase, toTitleCase } from '../utils';
import { IconRenderer } from '../common/icons/icon-renderer';
interface Column {
  header: string;
  accessorKey?: string;
  accessorFn?: (info: any) => any;
}

const idColumn = (idField = 'sk') => {
  return {
    field: idField,
    header: 'UID',
    accessorKey: idField,
    enableColumnOrdering: false,
    hidden: true,
    sortable: true,
    filterable: true,
    width: 150,
  };
};

// utils.js
export const determineMetaType = (key, field) => {
  if (field.format) {
    switch (field.format) {
      case 'uri':
      case 'url':
        // Further distinguish between image URLs and regular links
        if (field.mediaType && field.mediaType.startsWith('image/')) {
          return 'image';
        }
        return 'link';
      case 'date-time':
      case 'date':
        return 'date';
      case 'email':
        return 'email';
      case 'file':
        return 'file';
      case 'profile-image':
        return 'profileImage';
      // Add more formats as needed
      default:
        return null;
    }
  }

  if (field.enum) {
    return 'enum';
  }

  if (key.toLowerCase().includes('email')) {
    return 'email';
  }

  if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('portrait')) {
    return 'image';
  }

  if (key.toLowerCase() === 'status' || key.toLowerCase().includes('state')) {
    return 'status';
  }

  switch (field.type) {
    case 'boolean':
      return 'boolean';
    case 'number':
    case 'integer':
      return 'number';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    case 'string':
      return 'string';
    // Add more types as needed
    default:
      return null;
  }
};

export const convertSchemaToColumns = (idField, dataPrefix, schema, auditField = true, cellRenderers) => {
  const columns = [];

  const properties = schema?.properties || schema?.items?.properties || schema;
  if (properties) {
    for (const [key, field] of Object.entries(properties)) {
      const value: any = field;

      // Skip hidden fields
      if (value.hidden || value.hideInTable || value.hideIn?.includes('table')) continue;

      // Handle nested objects
      if (value.type === 'object' && value.properties) {
        for (const [subKey, subField] of Object.entries(value.properties)) {
          const subValue: any = subField;

          // Skip hidden sub-fields
          if (subValue.hidden || subValue.hideInTable) continue;

          const accessorKey = dataPrefix ? `${dataPrefix}.${key}.${subKey}` : `${key}.${subKey}`;

          columns.push({
            header: toSentenceCase(`${capitalizeFirstLetter(key)}.${capitalizeFirstLetter(subKey)}`),
            accessorKey,
            meta: determineMetaType(subKey, subValue), // Assign meta.type
          });
        }
      } else {
        const accessorKey = dataPrefix ? `${dataPrefix}.${key}` : `${key}`;

        columns.push({
          header: toSentenceCase(capitalizeFirstLetter(key)),
          accessorKey,
          meta: determineMetaType(key, value), // Assign meta.type
        });
      }
    }
  }

  // Assign cell renderers and other properties
  columns.forEach(column => {
    let thisRenderer = cellRenderers ? cellRenderers[column.accessorKey] : null;
    thisRenderer = thisRenderer || getDefaultRenderer(schema, column.meta);

    if (thisRenderer) {
      column.cell = thisRenderer;
    }
    column.filterFn = 'fuzzy';

    // Optionally, add additional metadata or properties here
  });

  if (auditField) {
    return [idColumn(idField), ...columns, ...getAudit()];
  }
  return columns;
};

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getTableColumns = (props: any) => {
  const { schema, hideAudit } = props;
  const columns = Object.keys(schema.properties)
    .filter(key => schema.properties[key].type !== 'object' && schema.properties[key].type !== 'array' && schema.properties[key].hidden !== true && schema.properties[key].hideInTable !== true)
    .map((key: any) => {
      return {
        field: `${key}`,
        accessorKey: `data.${key}`,
        header: `${toSentenceCase(key)
          }`,
        enableColumnOrdering: true,
        sortable: true,
        filterable: true,
        type: schema.properties[key].type,
        width: 150,
      };
    });
  const audit = hideAudit ? [] : getAudit();

  return [idColumn, ...columns, ...audit];
};

export const getTableColumnsLight: (schema: any) => any[] = schema => [
  `id`,
  ...Object.keys(schema.properties)
    .filter(key => schema.properties[key].type !== 'object' && schema.properties[key].type !== 'array' && schema.properties[key].hidden !== true && schema.properties[key].hideInTable !== true)
    .map((key: any) => `${key} `),
  'status',
  'author',
  'datatype',
  'subschema',
  'createdate',
  'modifydate',
];

const getAudit = () => {
  return ['state', 'author', 'datatype', 'subschema', 'createdate', 'modifydate'].map(item => ({
    field: `${item} `,
    accessorKey: `${item} `,
    header: `${toSentenceCase(item)} `,
    enableColumnOrdering: false,
    sortable: true,
    filterable: true,
    disableClickEventBubbling: true,
    width: 150,
  }));
};

function IndeterminateCheckbox({ indeterminate, className = '', ...rest }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} className={className + ' cursor-pointer'} {...rest} />;
}

const getDefaultRenderer = (schema, meta) => {
  if (!meta && schema) return null;

  const renderers = {
    boolean: ({ cell, row }) => {
      return row.original[cell.column.id] ? (
        <div className="w-5 h-5 rounded-full bg-green-500 text-white mx-auto flex items-center justify-center p-1">
          <IconRenderer icon="Check" />
        </div>
      ) : (
        <div className="w-5 h-5 p-1 rounded-full bg-red-500 mx-auto flex items-center justify-center">
          <IconRenderer icon="X" />
        </div>
      );
    },
    date: ({ cell }) => {
      return cell.value ? new Date(cell.value).toLocaleDateString() : '';
    },
    email: ({ cell }) => {
      return <a href={`mailto:${cell.value}`}>{cell.value}</a>;
    },
    file: ({ cell }) => {
      return cell.value ? <a href={cell.value}>Download</a> : '';
    },
    image: ({ cell }) => {
      return cell.value ? <img src={cell.value} alt="Image" className="w-8 h-8 rounded-full" /> : '';
    },
    link: ({ cell }) => {
      return cell.value ? <a href={cell.value}>{cell.value}</a> : '';
    },
    enum: ({ cell }) => {
      return cell.value ? toTitleCase(cell.value) : '';
    },
    number: ({ cell }) => {
      return cell.value ? cell.value.toLocaleString() : '';
    },
    array: ({ cell }) => {
      return cell.value ? cell.value.join(', ') : '';
    },
    object: ({ cell }) => {
      return cell.value ? JSON.stringify(cell.value) : '';
    },
    string: ({ cell }) => {
      return cell.value;
    },
    status: ({ cell }) => {
      return <span className={`px-2 py-1 rounded-full ${statusColors[cell.value.toLowerCase()]}`}>{cell.value}</span>;
    }
  };

  return renderers[meta];
}

const statusColors = {
  active: 'bg-green-500 text-white',
  inactive: 'bg-red-500 text-white',
  pending: 'bg-yellow-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
}

