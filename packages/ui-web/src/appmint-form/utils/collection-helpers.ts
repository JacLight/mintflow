import { deepCopy, getRandomString, isEmpty, toTitleCase } from "./helpers";
import { ControlType } from "./control-type";

export const dropBeforeOrAfter = (mouseY, elem) => {
  const bodyRect = document.body.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();
  const offsetTop = elemRect.top - bodyRect.top;
  if (mouseY > offsetTop + elemRect.height / 2) return 'after';
  return 'before';
};

export const getSchemaElementList = (schema, initPath = '') => {
  const elementList = {};

  const getDataPath = (path) => {
    let dataPath = path.replaceAll('.properties', '');
    dataPath = dataPath.replaceAll('.items', '');
    if (dataPath.startsWith('.')) dataPath = dataPath.substring(1);
    return dataPath;
  }

  const getElements = (schema, path) => {
    if (schema?.type === 'object') {
      const dataPath = getDataPath(path);
      if (dataPath) elementList[dataPath] = schema;

      Object.keys(schema.properties).forEach(key => {
        getElements(schema.properties[key], path + '.' + key);
      });

    } else if (schema?.type === 'array') {
      const dataPath = getDataPath(path);
      if (dataPath) elementList[dataPath] = schema;

      getElements(schema.items, path);
    } else {
      let dataPath = getDataPath(path);
      elementList[dataPath] = schema;
    }
  };
  getElements(schema, initPath);
  return elementList;
};

export const getControlType = (schema) => {
  if (schema['x-control']) return schema['x-control'];
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time' || schema.format === 'date' || schema.format === 'time') {
        return ControlType.date;
      }
      if (!isEmpty(schema.enum)) {
        return ControlType.selectMany;
      }
      return ControlType.textfield;
    case 'integer':
    case 'number':
      return ControlType.number;
    case 'boolean':
      return ControlType.selectSingle;
    case 'array':
      return ControlType.arrayContainer;
    case 'object':
      if (schema['x-layout'] && schema['x-layout'].type === 'tab') {
        return ControlType.tab;
      } else if (schema['x-layout'] && schema['x-layout'].type === 'accordion') {
        return ControlType.accordion;
      } else if (schema['x-layout'] && schema['x-layout'].type === 'slide') {
        return ControlType.slide;
      }
      return ControlType.container;
    default:
      return null;
  }
};


export const createSchemaLayout = (layoutId, type) => {
  const layoutSchema: any = {};
  layoutSchema.description = '';
  layoutSchema.id = layoutId
  layoutSchema.title = toTitleCase(layoutId);
  layoutSchema.type = 'object';
  // layoutSchema.fieldType = ControlType.container;
  layoutSchema.properties = {};
  layoutSchema['x-layout'] = {
    type: type,
    items: [
      {
        title: `${type} 1`,
        id: getRandomString(4),
        description: `${type} 1`,
      }
    ]
  }
  return layoutSchema;
};

export const cleanControlType = (controlType = '') => {
  if (!controlType) return '';
  return controlType.replaceAll(' ', '').toLowerCase().replaceAll('field', '');
}
