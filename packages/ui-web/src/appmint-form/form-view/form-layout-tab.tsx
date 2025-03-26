import { useShallow } from 'zustand/shallow';
import { classNames } from '../utils';
import { FormLayoutRender } from './form-layout-render';
import { useFormStore } from '../context/store';
import React from 'react';
import { StyledComponent } from '../form-elements/styling';

export const FormLayoutTab = ({ storeId, layoutPath, path, dataPath, theme }) => {
  const { getSchemaItem } = useFormStore(useShallow(state => ({ getSchemaItem: state.getSchemaItem })));
  const [value, setValue] = React.useState(layoutPath + '.items.0');

  const layout = getSchemaItem(layoutPath);
  const activeLayout = getSchemaItem(value);

  return (
    <div className="w-full">
      <StyledComponent
        componentType="tab"
        part="container"
        schema={layout}
      >
        <div className="flex gap-5 items-center justify-start p-2">
          {layout?.items?.map((item, idx) => {
            const itemPath = layoutPath + '.items.' + idx;
            return (
              <StyledComponent
                key={idx}
                componentType="tab"
                part={value === itemPath ? "buttonActive" : "button"}
                schema={layout}
              >
                <button title={item.label} onClick={e => setValue(itemPath)}>
                  {item.title}
                </button>
              </StyledComponent>
            );
          })}
        </div>
        {value && activeLayout ? <FormLayoutRender path={path} layoutPath={value} dataPath={dataPath} storeId={storeId} /> : <div className="text-xs w-full text-center text-red-400">empty layout</div>}
      </StyledComponent>
    </div>
  );
};

export const FormLayoutTab2 = ({ storeId, layoutPath, path, dataPath, theme }) => {
  const { getSchemaItem } = useFormStore.getState();
  const [value, setValue] = React.useState(layoutPath + '.items.0');

  const layout = getSchemaItem(layoutPath);
  const activeLayout = getSchemaItem(value);

  return (
    <div className=" w-full ">
      <div className="flex gap-1 items-center justify-start bg-gray-100 p-2">
        {layout?.items?.map((item, idx) => {
          const itemPath = layoutPath + '.items.' + idx;
          return (
            <div key={item.id} className={classNames('px-4 py-2  items-center flex justify-between bg-white gap-4 text-xs cursor-pointer hover:bg-cyan-50', value === itemPath ? 'bg-yellow-100' : '')} onClick={e => setValue(itemPath)}>
              {item.title}
            </div>
          );
        })}
      </div>
      <StyledComponent
        componentType="tab"
        part="container"
        schema={layout}
      >
        {value && activeLayout ? <FormLayoutRender path={path} layoutPath={value} dataPath={dataPath} storeId={storeId} /> : <div className="text-xs w-full text-center text-red-400">empty layout</div>}
      </StyledComponent>
    </div>
  );
};
