import { shallow, useShallow } from 'zustand/shallow';
import { classNames } from '../utils';
import { FormLayoutRender } from './form-layout-render';
import { useFormStore } from '../context/store';
import React from 'react';
import { StyledComponent } from '../form-elements/styling';

export const FormLayoutAccordion = ({ storeId, layoutPath, path, dataPath }) => {
  const { getSchemaItem } = useFormStore(useShallow(state => ({ getSchemaItem: state.getSchemaItem })));
  const [accordionState, setAccordionState] = React.useState([]);

  const toggleAccordion = itemPath => {
    if (accordionState.includes(itemPath)) {
      setAccordionState(accordionState.filter(path => path !== itemPath));
    } else {
      setAccordionState([...accordionState, itemPath]);
    }
  };

  const layout = getSchemaItem(layoutPath);
  return (
    <StyledComponent
      componentType="accordion"
      part="container"
      schema={layout}
      className="w-full"
    >
      {layout?.items?.map((item, idx) => {
        const itemPath = layoutPath + '.items.' + idx;
        const itemLayout = getSchemaItem(itemPath);
        return (
          <div key={item.id} className="mb-px">
            <StyledComponent
              componentType="accordion"
              part={accordionState.includes(itemPath) ? "headerActive" : "header"}
              schema={layout}
              onClick={e => toggleAccordion(itemPath)}
            >
              {item.title}
            </StyledComponent>
            {accordionState.includes(itemPath) && (
              <StyledComponent
                componentType="accordion"
                part="content"
                schema={layout}
              >
                {itemLayout ? <FormLayoutRender path={path} layoutPath={itemPath} dataPath={dataPath} storeId={storeId} /> : <div className="text-xs w-full text-center text-red-400">empty layout</div>}
              </StyledComponent>
            )}
          </div>
        );
      })}
    </StyledComponent>
  );
};
