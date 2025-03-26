import React, { useState, useEffect } from 'react';
import { SelectManyList } from './select-many-list';
import { toTitleCase } from '../utils';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface DateTimePickerProps {
  onChange?: (value: any) => void;
  placeholder?: string;
  isRange?: boolean;
  showPreset?: boolean;
  className?: string;
  mode?: 'date-time' | 'date' | 'time';
  min?: string;
  max?: string;
  startDate?: string;
  endDate?: string;
  readOnly?: boolean;
  disabled?: boolean;
  schema?: any;
  theme?: any;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isRange, setIsRange] = useState<boolean>(props.isRange || false);
  const [isInline, setIsInline] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [mode, setMode] = useState<'date-time' | 'date' | 'time'>(props.mode || 'date-time');
  const [error, setError] = useState<string>('');
  const [preset, setPreset] = useState<string>('today');

  useEffect(() => {
    let { startDate, endDate } = props;
    if (props.mode === 'time') {
      setStartDate(startDate || '');
      setEndDate(endDate || '');
    } else {
      const dateLength = props.mode === 'date' ? 10 : 16;
      try {
        const startDateObj = new Date(startDate || '');
        if (startDateObj && startDateObj.toString() !== 'Invalid Date') {
          setStartDate(startDateObj.toISOString().slice(0, dateLength));
        }
      } catch (e) {
        // Invalid date, keep current state
      }

      try {
        const endDateObj = new Date(endDate || '');
        if (endDateObj && endDateObj.toString() !== 'Invalid Date') {
          setEndDate(endDateObj.toISOString().slice(0, dateLength));
        }
      } catch (e) {
        // Invalid date, keep current state
      }
    }
    setMode(props.mode || 'date-time');
  }, [props.startDate, props.endDate, props.mode]);

  useEffect(() => {
    if (isRange && startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        setEndDate('');
        setError('End date cannot be earlier than start date.');
      } else {
        setError('');
      }
    }

    if (props.onChange) {
      let output: any = {};
      if (mode === 'time') {
        output = isRange ? { startDate, endDate } : { startDate };
      } else if (mode === 'date') {
        output = isRange ? { startDate, endDate } : { startDate };
      } else {
        output = isRange ? { startDate, endDate } : { startDate };
      }
      props.onChange(output);
    }
  }, [isRange, startDate, endDate, mode, props.onChange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const newDate = e.target.value;

    if (mode === 'time') {
      if (isStart) {
        setStartDate(newDate);
      } else {
        if (newDate >= startDate) {
          setEndDate(newDate);
          setError('');
        } else {
          setError('End date cannot be earlier than start date.');
        }
      }
    } else {
      if (isStart) {
        setStartDate(newDate);
      } else {
        if (new Date(newDate) >= new Date(startDate)) {
          setEndDate(newDate);
          setError('');
        } else {
          setError('End date cannot be earlier than start date.');
        }
      }
    }
  };

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    const { startDate, endDate } = getDateRange(newPreset);
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
  };

  const renderInputs = (isStart: boolean) => {
    let value: string;
    let min: string | undefined;

    if (mode === 'time') {
      value = isStart ? startDate : endDate;
      min = isStart ? undefined : startDate;
    } else if (mode === 'date') {
      value = isStart ? startDate : endDate;
      min = isStart ? undefined : startDate;
    } else {
      value = isStart ? `${startDate}` : `${endDate}`;
      min = isStart ? undefined : startDate;
    }

    const inputType = mode === 'date-time' ? 'datetime-local' : mode;

    return (
      <StyledComponent
        componentType="text"
        part="input"
        schema={props.schema}
        theme={props.theme}
        as="input"
        type={inputType}
        readOnly={props.readOnly}
        disabled={props.disabled}
        value={value}
        onChange={(e) => handleDateChange(e, isStart)}
        min={min}
        max={props.max}
        className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        aria-label={isStart ? "Start date" : "End date"}
        placeholder={props.placeholder}
      />
    );
  };

  return (
    <StyledComponent
      componentType="date-time-picker"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge(props.className)}
    >
      {showControls && (
        <StyledComponent
          componentType="date-time-picker"
          part="controls"
          schema={props.schema}
          theme={props.theme}
          className="space-y-4 mb-4"
        >
          <div>
            <StyledComponent
              componentType="date-time-picker"
              part="label"
              schema={props.schema}
              theme={props.theme}
              as="label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mode
            </StyledComponent>
            <StyledComponent
              componentType="date-time-picker"
              part="select"
              schema={props.schema}
              theme={props.theme}
              as="select"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'date-time' | 'date' | 'time')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date-time">Date and Time</option>
              <option value="date">Date only</option>
              <option value="time">Time only</option>
            </StyledComponent>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 text-sm font-medium text-gray-700">Range Mode</span>
              <StyledComponent
                componentType="date-time-picker"
                part="checkbox"
                schema={props.schema}
                theme={props.theme}
                as="input"
                type="checkbox"
                checked={isRange}
                onChange={(e) => setIsRange(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 text-sm font-medium text-gray-700">Inline Mode</span>
              <StyledComponent
                componentType="date-time-picker"
                part="checkbox"
                schema={props.schema}
                theme={props.theme}
                as="input"
                type="checkbox"
                checked={isInline}
                onChange={(e) => setIsInline(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </label>
          </div>
        </StyledComponent>
      )}

      {isRange ? (
        <div className="flex gap-2 items-center">
          {props.showPreset && (
            <StyledComponent
              componentType="date-time-picker"
              part="presetSelector"
              schema={props.schema}
              theme={props.theme}
            >
              <SelectManyList
                change={handlePresetChange}
                options={rangePresets.map(p => ({ label: toTitleCase(p), value: p }))}
                value={preset}
                theme={props.theme}
              />
            </StyledComponent>
          )}
          {renderInputs(true)}
          {renderInputs(false)}
        </div>
      ) : (
        renderInputs(true)
      )}

      {error && (
        <StyledComponent
          componentType="date-time-picker"
          part="error"
          schema={props.schema}
          theme={props.theme}
          as="p"
          className="mt-2 text-red-500 text-xs text-center"
          role="alert"
        >
          {error}
        </StyledComponent>
      )}

      {showPreview && (
        <StyledComponent
          componentType="date-time-picker"
          part="preview"
          schema={props.schema}
          theme={props.theme}
          className="mt-6 p-4 bg-gray-100 rounded-md"
        >
          <StyledComponent
            componentType="date-time-picker"
            part="previewTitle"
            schema={props.schema}
            theme={props.theme}
            as="h3"
            className="text-lg font-semibold mb-2 text-gray-700"
          >
            Selected:
          </StyledComponent>
          <StyledComponent
            componentType="date-time-picker"
            part="previewContent"
            schema={props.schema}
            theme={props.theme}
            as="p"
            className="text-sm text-gray-600"
          >
            {isRange ? (
              <>
                From: {startDate}
                <br />
                To: {endDate}
              </>
            ) : (
              <>
                {mode === 'date' && `Date: ${startDate}`}
                {mode === 'time' && `Time: ${startDate}`}
                {mode === 'date-time' && `Date and Time: ${startDate}`}
              </>
            )}
          </StyledComponent>
        </StyledComponent>
      )}
    </StyledComponent>
  );
};

const rangePresets = ['today', 'yesterday', 'this week', 'last week', 'this month', 'last month', 'this quarter', 'this year', 'last year'];
const getDateRange = preset => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const thisWeek = new Date();
  thisWeek.setDate(today.getDate() - today.getDay());
  const lastWeek = new Date(thisWeek);
  lastWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const thisQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
  const lastQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 - 3, 1);
  const thisYear = new Date(today.getFullYear(), 0, 1);
  const lastYear = new Date(today.getFullYear() - 1, 0, 1);

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'yesterday':
      return { startDate: yesterday, endDate: yesterday };
    case 'this week':
      return { startDate: thisWeek, endDate: today };
    case 'last week':
      return { startDate: lastWeek, endDate: thisWeek };
    case 'this month':
      return { startDate: thisMonth, endDate: today };
    case 'last month':
      return { startDate: lastMonth, endDate: thisMonth };
    case 'this quarter':
      return { startDate: thisQuarter, endDate: today };
    case 'last quarter':
      return { startDate: lastQuarter, endDate: thisQuarter };
    case 'this year':
      return { startDate: thisYear, endDate: today };
    case 'last year':
      return { startDate: lastYear, endDate: thisYear };
    default:
      return { startDate: today, endDate: today };
  }
};
