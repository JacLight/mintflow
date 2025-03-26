import React, { useState, useEffect, useRef } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface PhoneElementProps {
  update?: (value: string) => void;
  change?: (value: string) => void;
  blur?: (value: string) => void;
  focus?: () => void;
  mode?: string;
  schema?: any;
  path?: string;
  name?: string;
  data?: string;
  value?: string;
  theme?: any;
  className?: string;
}

export const PhoneElement: React.FC<PhoneElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get phone styling
  const containerClasses = getComponentPartStyling('phone',  'container', '',  props.theme,  customStyling);
  const dropdownButtonClasses = getComponentPartStyling('phone',  'dropdownButton', '',  props.theme,  customStyling);
  const dropdownMenuClasses = getComponentPartStyling('phone',  'dropdownMenu', '',  props.theme,  customStyling);
  const dropdownItemClasses = getComponentPartStyling('phone',  'dropdownItem', '',  props.theme,  customStyling);
  const dropdownItemSelectedClasses = getComponentPartStyling('phone',  'dropdownItemSelected', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('phone',  'input', '',  props.theme,  customStyling);
  const flagClasses = getComponentPartStyling('phone',  'flag', '',  props.theme,  customStyling);

  // State for phone value and country code
  const [phoneValue, setPhoneValue] = useState<string>(props.data || props.value || '');
  const [countryCode, setCountryCode] = useState<string>('+1'); // Default to US
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update value when props.data or props.value changes
  useEffect(() => {
    if (props.data && props.data !== phoneValue) {
      setPhoneValue(props.data);
    } else if (props.value && props.value !== phoneValue) {
      setPhoneValue(props.value);
    }
  }, [props.data, props.value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPhoneValue(newValue);

    // Notify parent component of change
    if (props.change) {
      props.change(`${countryCode} ${newValue}`);
    }
    if (props.update) {
      props.update(`${countryCode} ${newValue}`);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    if (props.blur) {
      props.blur(`${countryCode} ${phoneValue}`);
    }
  };

  // Handle focus event
  const handleFocus = () => {
    if (props.focus) {
      props.focus();
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Select country code
  const selectCountryCode = (code: string) => {
    setCountryCode(code);
    setIsDropdownOpen(false);

    // Notify parent component of change
    if (props.change) {
      props.change(`${code} ${phoneValue}`);
    }
    if (props.update) {
      props.update(`${code} ${phoneValue}`);
    }
  };

  return (
    <div className="relative">
      <StyledComponent
        componentType="phone"
        part="container"
        schema={props.schema}
        theme={props.theme}
        className={twMerge("flex items-center", props.className)}
      >
        <StyledComponent
          componentType="phone"
          part="dropdownButton"
          schema={props.schema}
          theme={props.theme}
          as="button"
          type="button"
          className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100"
          onClick={toggleDropdown}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <svg fill="none" aria-hidden="true" className="h-4 w-4 me-2" viewBox="0 0 20 15">
            <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
            <mask id="a" width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
              <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
            </mask>
            <g mask="url(#a)">
              <path
                fill="#D02F44"
                fillRule="evenodd"
                d="M19.6.5H0v.933h19.6V.5zm0 1.867H0V3.3h19.6v-.933zM0 4.233h19.6v.934H0v-.934zM19.6 6.1H0v.933h19.6V6.1zM0 7.967h19.6V8.9H0v-.933zm19.6 1.866H0v.934h19.6v-.934zM0 11.7h19.6v.933H0V11.7zm19.6 1.867H0v.933h19.6v-.933z"
                clipRule="evenodd"
              />
              <path fill="#46467F" d="M0 .5h8.4v6.533H0z" />
              <g filter="url(#filter0_d_343_121520)">
                <path
                  fill="url(#paint0_linear_343_121520)"
                  fillRule="evenodd"
                  d="M1.867 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.866 0a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM7.467 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zM2.333 3.3a.467.467 0 100-.933.467.467 0 000 .933zm2.334-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.4.467a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm-2.334.466a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.466a.467.467 0 11-.933 0 .467.467 0 01.933 0zM1.4 4.233a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM6.533 4.7a.467.467 0 11-.933 0 .467.467 0 01.933 0zM7 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zM3.267 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0z"
                  clipRule="evenodd"
                />
              </g>
            </g>
            <defs>
              <linearGradient id="paint0_linear_343_121520" x1=".933" x2=".933" y1="1.433" y2="6.1" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" />
                <stop offset="1" stopColor="#F0F0F0" />
              </linearGradient>
              <filter id="filter0_d_343_121520" width="6.533" height="5.667" x=".933" y="1.433" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_343_121520" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_343_121520" result="shape" />
              </filter>
            </defs>
          </svg>
          {countryCode}{' '}
          <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
          </svg>
        </StyledComponent>

        <StyledComponent
          componentType="phone"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          id="phone-input"
          className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-0 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          placeholder="123-456-7890"
          value={phoneValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required
        />
      </StyledComponent>

      {isDropdownOpen && (
        <StyledComponent
          componentType="phone"
          part="dropdownMenu"
          schema={props.schema}
          theme={props.theme}
          className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow w-52 top-full"
          ref={dropdownRef}
        >
          <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdown-phone-button">
            <li>
              <StyledComponent
                componentType="phone"
                part="dropdownItem"
                schema={props.schema}
                theme={props.theme}
                as="button"
                type="button"
                className={twMerge(
                  "inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  countryCode === '+1' ? 'bg-gray-100' : ''
                )}
                role="menuitem"
                onClick={() => selectCountryCode('+1')}
              >
                <div className="inline-flex items-center">
                  <svg fill="none" aria-hidden="true" className="h-4 w-4 me-2" viewBox="0 0 20 15">
                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    <mask id="a" width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                      <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    </mask>
                    <g mask="url(#a)">
                      <path
                        fill="#D02F44"
                        fillRule="evenodd"
                        d="M19.6.5H0v.933h19.6V.5zm0 1.867H0V3.3h19.6v-.933zM0 4.233h19.6v.934H0v-.934zM19.6 6.1H0v.933h19.6V6.1zM0 7.967h19.6V8.9H0v-.933zm19.6 1.866H0v.934h19.6v-.934zM0 11.7h19.6v.933H0V11.7zm19.6 1.867H0v.933h19.6v-.933z"
                        clipRule="evenodd"
                      />
                      <path fill="#46467F" d="M0 .5h8.4v6.533H0z" />
                    </g>
                  </svg>
                  United States (+1)
                </div>
              </StyledComponent>
            </li>
            <li>
              <StyledComponent
                componentType="phone"
                part="dropdownItem"
                schema={props.schema}
                theme={props.theme}
                as="button"
                type="button"
                className={twMerge(
                  "inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  countryCode === '+44' ? 'bg-gray-100' : ''
                )}
                role="menuitem"
                onClick={() => selectCountryCode('+44')}
              >
                <div className="inline-flex items-center">
                  <svg className="h-4 w-4 me-2" fill="none" viewBox="0 0 20 15">
                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    <mask id="a" width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                      <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    </mask>
                    <g mask="url(#a)">
                      <path fill="#0A17A7" d="M0 .5h19.6v14H0z" />
                    </g>
                  </svg>
                  United Kingdom (+44)
                </div>
              </StyledComponent>
            </li>
            <li>
              <StyledComponent
                componentType="phone"
                part="dropdownItem"
                schema={props.schema}
                theme={props.theme}
                as="button"
                type="button"
                className={twMerge(
                  "inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  countryCode === '+61' ? 'bg-gray-100' : ''
                )}
                role="menuitem"
                onClick={() => selectCountryCode('+61')}
              >
                <div className="inline-flex items-center">
                  <svg className="h-4 w-4 me-2" fill="none" viewBox="0 0 20 15">
                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    <mask id="a" width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                      <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    </mask>
                    <g mask="url(#a)">
                      <path fill="#0A17A7" d="M0 .5h19.6v14H0z" />
                    </g>
                  </svg>
                  Australia (+61)
                </div>
              </StyledComponent>
            </li>
            <li>
              <StyledComponent
                componentType="phone"
                part="dropdownItem"
                schema={props.schema}
                theme={props.theme}
                as="button"
                type="button"
                className={twMerge(
                  "inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                  countryCode === '+49' ? 'bg-gray-100' : ''
                )}
                role="menuitem"
                onClick={() => selectCountryCode('+49')}
              >
                <div className="inline-flex items-center">
                  <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 20 15">
                    <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    <mask id="a" width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                      <rect width="19.6" height="14" y=".5" fill="#fff" rx="2" />
                    </mask>
                    <g mask="url(#a)">
                      <path fill="#262626" fillRule="evenodd" d="M0 5.167h19.6V.5H0v4.667z" clipRule="evenodd" />
                    </g>
                  </svg>
                  Germany (+49)
                </div>
              </StyledComponent>
            </li>
            <li>
              <StyledComponent
                componentType="phone"
                part="dropdownItem"
                schema={props.schema}
                theme={props.theme}
                as="button"
                type="button"
                className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => selectCountryCode('+33')}
              >
                <div className="inline-flex items-center">
                  <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 20 15">
                    <rect width="19.1" height="13.5" x=".25" y=".75" fill="#fff" stroke="#F5F5F5" strokeWidth=".5" rx="1.75" />
                    <mask id="a" width="20" height="15" x="0" y="0" maskUnits="userSpaceOnUse">
                      <rect width="19.1" height="13.5" x=".25" y=".75" fill="#fff" stroke="#fff" strokeWidth=".5" rx="1.75" />
                    </mask>
                    <g mask="url(#a)">
                      <path fill="#F44653" d="M13.067.5H19.6v14h-6.533z" />
                      <path fill="#1035BB" fillRule="evenodd" d="M0 14.5h6.533V.5H0v14z" clipRule="evenodd" />
                    </g>
                  </svg>
                  France (+33)
                </div>
              </StyledComponent>
            </li>
          </ul>
        </StyledComponent>
      )}
    </div>
  );
};
