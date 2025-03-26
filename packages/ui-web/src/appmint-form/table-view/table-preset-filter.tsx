import React, { useState } from 'react';
import { SelectManyCombo } from '../form-elements/select-many-combo';
import { useTheme } from '../../../../../contexts/theme-context';

export const TablePresetFilter: React.FC<any> = ({ filterPreset }) => {
  const [filter, setFilter] = useState(filterPreset.default);

  const onChange = value => {
    console.log(value);
  };

  return (
    <div className="w-full lg:max-w-80">
      <SelectManyCombo
        options={filterPreset.options?.map(i => ({ label: i, value: i }))}
        value={filter}
        change={onChange}
        schema={{
          placeholder: `Filter ${filterPreset.property}`,
          theme: {
            combo: {
              button: 'dark:bg-gray-700 dark:text-white dark:ring-gray-600',
              input: 'dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
              options: 'dark:bg-gray-800 dark:text-white',
              option: 'dark:text-gray-200 dark:hover:bg-gray-700'
            }
          }
        }}
      />
    </div>
  );
};
