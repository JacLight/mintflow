import React, { useState } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const LegalConsentElement = (props: {
  schema?;
  theme?;
  change?;
  value?;
}) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get legal consent styling
  const containerClasses = getComponentPartStyling('legal-consent', 'container', '', props.theme, customStyling);
  const formClasses = getComponentPartStyling('legal-consent', 'form', '', props.theme, customStyling);
  const labelClasses = getComponentPartStyling('legal-consent', 'label', '', props.theme, customStyling);
  const inputClasses = getComponentPartStyling('legal-consent', 'input', '', props.theme, customStyling);
  const errorClasses = getComponentPartStyling('legal-consent', 'error', '', props.theme, customStyling);
  const buttonContainerClasses = getComponentPartStyling('legal-consent', 'buttonContainer', '', props.theme, customStyling);
  const acceptButtonClasses = getComponentPartStyling('legal-consent', 'acceptButton', '', props.theme, customStyling);
  const rejectButtonClasses = getComponentPartStyling('legal-consent', 'rejectButton', '', props.theme, customStyling);
  const resultClasses = getComponentPartStyling('legal-consent', 'result', '', props.theme, customStyling);
  const modifyButtonClasses = getComponentPartStyling('legal-consent', 'modifyButton', '', props.theme, customStyling);

  // Initialize state from props.value if available
  const initialValue = props.value || { fullName: '', consentGiven: null };
  const [fullName, setFullName] = useState(initialValue.fullName || '');
  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(initialValue.consentGiven !== null);
  const [consentGiven, setConsentGiven] = useState(initialValue.consentGiven);

  const validateFullName = (name) => {
    return name.trim().split(' ').length > 1;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFullName(name);
    setIsFullNameValid(validateFullName(name));
  };

  const handleSubmit = (accept) => {
    if (!validateFullName(fullName)) {
      setIsFullNameValid(false);
      return;
    }

    setFormSubmitted(true);
    setConsentGiven(accept);

    // Notify parent component of change
    if (props.change) {
      props.change({ fullName, consentGiven: accept });
    }
  };

  const resetForm = () => {
    setFormSubmitted(false);
    setConsentGiven(null);

    // Don't clear the name when modifying consent
    // Notify parent component of change
    if (props.change) {
      props.change({ fullName, consentGiven: null });
    }
  };

  return (
    <StyledComponent
      componentType="legal-consent"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="w-full border shadow-sm rounded p-4"
    >
      {!formSubmitted ? (
        <StyledComponent
          componentType="legal-consent"
          part="form"
          schema={props.schema}
          theme={props.theme}
          as="div"
          className="space-y-4"
        >
          <div>
            <StyledComponent
              componentType="legal-consent"
              part="label"
              schema={props.schema}
              theme={props.theme}
              as="label"
              htmlFor="fullName"
              className="block text-xs font-medium text-gray-700"
            >
              Full Name
            </StyledComponent>
            <StyledComponent
              componentType="legal-consent"
              part="input"
              schema={props.schema}
              theme={props.theme}
              as="input"
              type="text"
              id="fullName"
              value={fullName}
              onChange={handleNameChange}
              className={twMerge(
                "mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-1 shadow-sm sm:text-sm border-gray-300 rounded",
                !isFullNameValid && "border-red-500"
              )}
              placeholder="Enter your full name"
              aria-invalid={!isFullNameValid}
              aria-describedby={!isFullNameValid ? "fullName-error" : undefined}
            />
            {!isFullNameValid && (
              <StyledComponent
                componentType="legal-consent"
                part="error"
                schema={props.schema}
                theme={props.theme}
                as="p"
                id="fullName-error"
                className="text-red-500 text-xs mt-1"
              >
                Please enter your full name.
              </StyledComponent>
            )}
          </div>

          <StyledComponent
            componentType="legal-consent"
            part="buttonContainer"
            schema={props.schema}
            theme={props.theme}
            as="div"
            className="flex justify-between gap-4"
          >
            <StyledComponent
              componentType="legal-consent"
              part="acceptButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              onClick={() => handleSubmit(true)}
              className="inline-flex justify-center py-1 px-2 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              I Accept
            </StyledComponent>
            <StyledComponent
              componentType="legal-consent"
              part="rejectButton"
              schema={props.schema}
              theme={props.theme}
              as="button"
              onClick={() => handleSubmit(false)}
              className="inline-flex justify-center py-1 px-2 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              I Do Not Accept
            </StyledComponent>
          </StyledComponent>
        </StyledComponent>
      ) : (
        <StyledComponent
          componentType="legal-consent"
          part="result"
          schema={props.schema}
          theme={props.theme}
          as="div"
          className="text-center"
        >
          <p className="text-center">
            <strong>{fullName}</strong> has {consentGiven ? 'accepted' : 'not accepted'} the terms.
          </p>
          <StyledComponent
            componentType="legal-consent"
            part="modifyButton"
            schema={props.schema}
            theme={props.theme}
            as="button"
            onClick={resetForm}
            className="mt-4 inline-flex justify-center py-1 px-2 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Modify Consent
          </StyledComponent>
        </StyledComponent>
      )}
    </StyledComponent>
  );
};
