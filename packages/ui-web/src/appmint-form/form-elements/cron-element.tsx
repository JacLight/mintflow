import React, { useState, useEffect } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface CronElementProps {
  change?: (value: string) => void;
  focus?: () => void;
  blur?: (value: string) => void;
  mode?: string;
  value?: string;
  schema?: any;
  path?: string;
  name?: string;
  data?: any;
  theme?: any;
  className?: string;
}

export const CronElement: React.FC<CronElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get cron-element styling
  const containerClasses = getComponentPartStyling('cron-element',  'container', '',  props.theme,  customStyling);
  const expressionContainerClasses = getComponentPartStyling('cron-element',  'expressionContainer', '',  props.theme,  customStyling);
  const expressionClasses = getComponentPartStyling('cron-element',  'expression', '',  props.theme,  customStyling);
  const summaryClasses = getComponentPartStyling('cron-element',  'summary', '',  props.theme,  customStyling);
  const buttonClasses = getComponentPartStyling('cron-element',  'button', '',  props.theme,  customStyling);
  const primaryButtonClasses = getComponentPartStyling('cron-element',  'primaryButton', '',  props.theme,  customStyling);
  const secondaryButtonClasses = getComponentPartStyling('cron-element',  'secondaryButton', '',  props.theme,  customStyling);
  const tabsContainerClasses = getComponentPartStyling('cron-element',  'tabsContainer', '',  props.theme,  customStyling);
  const tabClasses = getComponentPartStyling('cron-element',  'tab', '',  props.theme,  customStyling);
  const activeTabClasses = getComponentPartStyling('cron-element',  'activeTab', '',  props.theme,  customStyling);
  const fieldContainerClasses = getComponentPartStyling('cron-element',  'fieldContainer', '',  props.theme,  customStyling);
  const labelClasses = getComponentPartStyling('cron-element',  'label', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('cron-element',  'input', '',  props.theme,  customStyling);
  const selectClasses = getComponentPartStyling('cron-element',  'select', '',  props.theme,  customStyling);
  const dayButtonClasses = getComponentPartStyling('cron-element',  'dayButton', '',  props.theme,  customStyling);
  const activeDayButtonClasses = getComponentPartStyling('cron-element',  'activeDayButton', '',  props.theme,  customStyling);
  const quickButtonClasses = getComponentPartStyling('cron-element',  'quickButton', '',  props.theme,  customStyling);

  // State for each part of the cron expression
  const [minutes, setMinutes] = useState('*');
  const [hours, setHours] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [activeTab, setActiveTab] = useState('simple');
  const [cronExpression, setCronExpression] = useState('* * * * *');
  const [scheduleSummary, setScheduleSummary] = useState('Every minute');

  // Multi-select state for days of week
  const [selectedDays, setSelectedDays] = useState({
    0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
  });

  // Update cron expression when any part changes
  useEffect(() => {
    const newCronExpression = `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setCronExpression(newCronExpression);
    updateScheduleSummary(newCronExpression);
  }, [minutes, hours, dayOfMonth, month, dayOfWeek]);

  // Initialize cron expression from props.value if provided
  useEffect(() => {
    if (props.value && typeof props.value === 'string') {
      const parts = props.value.split(' ');
      if (parts.length === 5) {
        setMinutes(parts[0]);
        setHours(parts[1]);
        setDayOfMonth(parts[2]);
        setMonth(parts[3]);
        setDayOfWeek(parts[4]);

        // Update selected days based on the day of week expression
        if (parts[4] === '*') {
          setSelectedDays({ 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
        } else {
          const newSelectedDays = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
          const dayParts = parts[4].split(',');

          dayParts.forEach(part => {
            if (part.includes('-')) {
              const [start, end] = part.split('-').map(Number);
              for (let i = start; i <= end; i++) {
                newSelectedDays[i] = true;
              }
            } else {
              newSelectedDays[parseInt(part)] = true;
            }
          });

          setSelectedDays(newSelectedDays);
        }
      }
    }
  }, [props.value]);

  // Notify parent component of changes
  useEffect(() => {
    if (props.change) {
      props.change(cronExpression);
    }
  }, [cronExpression, props.change]);

  // Handle day of week selection
  const handleDaySelect = (day: number) => {
    const newSelectedDays = { ...selectedDays, [day]: !selectedDays[day] };
    setSelectedDays(newSelectedDays);

    // Convert selected days to cron expression format
    const selectedDaysList = Object.entries(newSelectedDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => day);

    if (selectedDaysList.length === 0) {
      setDayOfWeek('*');
    } else if (selectedDaysList.length === 7) {
      setDayOfWeek('*');
    } else {
      setDayOfWeek(selectedDaysList.join(','));
    }
  };

  // Handle hour selection (single or range)
  const handleHourSelect = (hour: string) => {
    setHours(hour);
  };

  // Handle applying a preset
  const applyPreset = (preset: { label: string; expression: string }) => {
    const parts = preset.expression.split(' ');
    setMinutes(parts[0]);
    setHours(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);

    // Update selected days based on the day of week expression
    if (parts[4] === '*') {
      setSelectedDays({ 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
    } else {
      const newSelectedDays = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
      const dayParts = parts[4].split(',');

      dayParts.forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          for (let i = start; i <= end; i++) {
            newSelectedDays[i] = true;
          }
        } else {
          newSelectedDays[parseInt(part)] = true;
        }
      });

      setSelectedDays(newSelectedDays);
    }
  };

  // Generate human-readable summary of the schedule
  const updateScheduleSummary = (cron: string) => {
    const parts = cron.split(' ');
    let summary = '';

    // This is a simplified summary generator
    if (parts[0] === '*' && parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      summary = 'Every minute';
    } else if (parts[0].startsWith('*/') && parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      summary = `Every ${parts[0].split('/')[1]} minutes`;
    } else if (parts[0] === '0' && parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      summary = 'At the start of every hour';
    } else if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      summary = 'At midnight every day';
    } else if (parts[0] === '0' && parts[1] === '12' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      summary = 'At noon every day';
    } else if (parts[4] === '1-5') {
      summary = 'On weekdays';
    } else if (parts[4] === '0,6') {
      summary = 'On weekends';
    } else {
      summary = 'Custom schedule';
    }

    setScheduleSummary(summary);
  };

  // Copy cron expression to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronExpression)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // When blur is called, pass the current cron expression
  const handleBlur = () => {
    if (props.blur) {
      props.blur(cronExpression);
    }
  };

  const presets = [
    { label: 'Every minute', expression: '* * * * *' },
    { label: 'Every hour', expression: '0 * * * *' },
    { label: 'Every day at midnight', expression: '0 0 * * *' },
    { label: 'Every day at noon', expression: '0 12 * * *' },
    { label: 'Weekdays at 9am', expression: '0 9 * * 1-5' },
    { label: 'Weekends at 10am', expression: '0 10 * * 0,6' }
  ];

  const renderSimpleTab = () => (
    <StyledComponent
      componentType="cron-element"
      part="tabContent"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("space-y-4", props.className)}
    >
      {/* Time selection */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Time
        </StyledComponent>
        <div className="flex space-x-2">
          <StyledComponent
            componentType="cron-element"
            part="select"
            schema={props.schema}
            theme={props.theme}
            as="select"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="p-1 text-sm border border-gray-300 rounded"
            aria-label="Hour"
          >
            <option value="*">Every hour</option>
            <option value="0">12am</option>
            <option value="6">6am</option>
            <option value="9">9am</option>
            <option value="12">12pm</option>
            <option value="15">3pm</option>
            <option value="18">6pm</option>
            <option value="21">9pm</option>
          </StyledComponent>
          <span className="flex items-center">:</span>
          <StyledComponent
            componentType="cron-element"
            part="select"
            schema={props.schema}
            theme={props.theme}
            as="select"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="p-1 text-sm border border-gray-300 rounded"
            aria-label="Minute"
          >
            <option value="*">Every minute</option>
            <option value="0">00</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="*/5">Every 5m</option>
            <option value="*/15">Every 15m</option>
            <option value="*/30">Every 30m</option>
          </StyledComponent>
        </div>
      </StyledComponent>

      {/* Day selection */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Days
        </StyledComponent>
        <div className="flex flex-wrap gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part={selectedDays[index] ? "activeDayButton" : "dayButton"}
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => handleDaySelect(index)}
              className={`w-6 h-6 text-xs flex items-center justify-center rounded-full 
                ${selectedDays[index] ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label={`${selectedDays[index] ? 'Deselect' : 'Select'} ${index === 0 ? 'Sunday' :
                  index === 1 ? 'Monday' :
                    index === 2 ? 'Tuesday' :
                      index === 3 ? 'Wednesday' :
                        index === 4 ? 'Thursday' :
                          index === 5 ? 'Friday' : 'Saturday'
                }`}
              aria-pressed={selectedDays[index]}
            >
              {day}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>

      {/* Quick presets */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Quick Presets
        </StyledComponent>
        <div className="flex flex-wrap gap-1">
          {presets.map((preset, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part="quickButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {preset.label}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>
    </StyledComponent>
  );

  const renderAdvancedTab = () => (
    <StyledComponent
      componentType="cron-element"
      part="tabContent"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("space-y-4", props.className)}
    >
      {/* Minutes */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Minutes
        </StyledComponent>
        <StyledComponent
          componentType="cron-element"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded"
          placeholder="* or */15 or 0,30"
          aria-label="Minutes"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {['*', '*/5', '*/15', '0'].map((value, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part="quickButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => setMinutes(value)}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {value}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>

      {/* Hours */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Hours
        </StyledComponent>
        <StyledComponent
          componentType="cron-element"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded"
          placeholder="* or */2 or 9-17"
          aria-label="Hours"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {['*', '9-17', '0', '12'].map((value, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part="quickButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => handleHourSelect(value)}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {value}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>

      {/* Day of Month */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Day of Month
        </StyledComponent>
        <StyledComponent
          componentType="cron-element"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded"
          placeholder="* or 1,15 or 1-5"
          aria-label="Day of Month"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {['*', '1', 'L'].map((value, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part="quickButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => setDayOfMonth(value)}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {value}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>

      {/* Month */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Month
        </StyledComponent>
        <StyledComponent
          componentType="cron-element"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded"
          placeholder="* or 1,6,12"
          aria-label="Month"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {['*', '1-3', '6-8'].map((value, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part="quickButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => setMonth(value)}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {value}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>

      {/* Day of Week */}
      <StyledComponent
        componentType="cron-element"
        part="fieldContainer"
        schema={props.schema}
        theme={props.theme}
      >
        <StyledComponent
          componentType="cron-element"
          part="label"
          schema={props.schema}
          theme={props.theme}
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Day of Week (0=Sun, 1=Mon, ...)
        </StyledComponent>
        <StyledComponent
          componentType="cron-element"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded"
          placeholder="* or 1-5 or 0,6"
          aria-label="Day of Week"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {['*', '1-5', '0,6'].map((value, index) => (
            <StyledComponent
              key={index}
              componentType="cron-element"
              part="quickButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              type="button"
              onClick={() => setDayOfWeek(value)}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {value}
            </StyledComponent>
          ))}
        </div>
      </StyledComponent>
    </StyledComponent>
  );

  return (
    <StyledComponent
      componentType="cron-element"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("w-full max-w-md mx-auto bg-white rounded-lg shadow p-4", props.className)}
      onBlur={handleBlur}
    >
      {/* Cron Expression Display */}
      <StyledComponent
        componentType="cron-element"
        part="expressionContainer"
        schema={props.schema}
        theme={props.theme}
        className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded"
      >
        <div>
          <StyledComponent
            componentType="cron-element"
            part="expression"
            schema={props.schema}
            theme={props.theme}
            className="font-mono text-sm"
          >
            {cronExpression}
          </StyledComponent>
          <StyledComponent
            componentType="cron-element"
            part="summary"
            schema={props.schema}
            theme={props.theme}
            className="text-xs text-gray-500"
          >
            {scheduleSummary}
          </StyledComponent>
        </div>
        <div className="flex space-x-1">
          <StyledComponent
            componentType="cron-element"
            part="secondaryButton"
            schema={props.schema}
            theme={props.theme}
            as="button"
            type="button"
            onClick={() => {
              setMinutes('*');
              setHours('*');
              setDayOfMonth('*');
              setMonth('*');
              setDayOfWeek('*');
              setSelectedDays({ 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
            }}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
          >
            Clear
          </StyledComponent>
          <StyledComponent
            componentType="cron-element"
            part="primaryButton"
            schema={props.schema}
            theme={props.theme}
            as="button"
            type="button"
            onClick={copyToClipboard}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          >
            Copy
          </StyledComponent>
        </div>
      </StyledComponent>

      {/* Tabs */}
      <StyledComponent
        componentType="cron-element"
        part="tabsContainer"
        schema={props.schema}
        theme={props.theme}
        className="flex border-b mb-3"
      >
        <StyledComponent
          componentType="cron-element"
          part={activeTab === 'simple' ? 'activeTab' : 'tab'}
          schema={props.schema}
          theme={props.theme}
          as="button"
          type="button"
          onClick={() => setActiveTab('simple')}
          className={`px-3 py-1 text-sm font-medium ${activeTab === 'simple' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          aria-selected={activeTab === 'simple'}
          role="tab"
        >
          Simple
        </StyledComponent>
        <StyledComponent
          componentType="cron-element"
          part={activeTab === 'advanced' ? 'activeTab' : 'tab'}
          schema={props.schema}
          theme={props.theme}
          as="button"
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`px-3 py-1 text-sm font-medium ${activeTab === 'advanced' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          aria-selected={activeTab === 'advanced'}
          role="tab"
        >
          Advanced
        </StyledComponent>
      </StyledComponent>

      {/* Tab Content */}
      {activeTab === 'simple' ? renderSimpleTab() : renderAdvancedTab()}
    </StyledComponent>
  );
};
