import React, { useEffect, useRef, useState } from 'react';
import { SelectManyList } from './select-many-list';
import { IconPickerElement } from './icon-picker-element';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface SocialTextAreaProps {
  readOnly?: boolean;
  change?: (value: string) => void;
  keyPress?: (e: React.KeyboardEvent) => boolean | void;
  focus?: (value: string) => void;
  blur?: (value: string) => void;
  mode?: string;
  value?: string;
  disabled?: boolean;
  id?: string;
  schema?: any;
  path?: string;
  name?: string;
  data?: any;
  platform?: string;
  className?: string;
  theme?: any;
}

export const SocialTextArea: React.FC<SocialTextAreaProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get social textarea styling
  const containerClasses = getComponentPartStyling('social-textarea', 'container', '', props.theme, customStyling);
  const textareaClasses = getComponentPartStyling('social-textarea', 'textarea', '', props.theme, customStyling);
  const controlsClasses = getComponentPartStyling('social-textarea', 'controls', '', props.theme, customStyling);
  const platformSelectorClasses = getComponentPartStyling('social-textarea', 'platformSelector', '', props.theme, customStyling);
  const iconPickerClasses = getComponentPartStyling('social-textarea', 'iconPicker', '', props.theme, customStyling);
  const counterClasses = getComponentPartStyling('social-textarea', 'counter', '', props.theme, customStyling);
  const counterWarningClasses = getComponentPartStyling('social-textarea', 'counterWarning', '', props.theme, customStyling);
  const counterErrorClasses = getComponentPartStyling('social-textarea', 'counterError', '', props.theme, customStyling);
  const suggestionsClasses = getComponentPartStyling('social-textarea', 'suggestions', '', props.theme, customStyling);
  const suggestionItemClasses = getComponentPartStyling('social-textarea', 'suggestionItem', '', props.theme, customStyling);
  const suggestionSelectedClasses = getComponentPartStyling('social-textarea', 'suggestionSelected', '', props.theme, customStyling);

  const [message, setMessage] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [socialPlatform, setSocialPlatform] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessage(props.value || '');
    if (props.platform) {
      setSocialPlatform(socialCharacterCounts.find(x => x.key === props.platform));
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [props.value, props.platform]);

  useEffect(() => {
    setCharCount(message?.length || 0);
  }, [message]);

  const filterSuggestions = (value: string): string[] => {
    if (value.length < 2) return [];

    const data = props.schema?.suggestions || [];
    return data.filter((item: string) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (props.keyPress) {
      if (props.keyPress(e) === true) {
        e.preventDefault();
        setMessage('');
      }
    }

    if (isOpen) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault();
            setMessage(suggestions[selectedIndex]);
            setIsOpen(false);
            setSuggestions([]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
        default:
          break;
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();

    if (props.change) {
      props.change(suggestion);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (props.blur) {
      props.blur(e.target.value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const value = e.target.value;
    setMessage(value);

    if (props.change) {
      props.change(value);
    }

    if (props.schema?.suggestions) {
      const filtered = filterSuggestions(value);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (props.focus) {
      props.focus(e.target.value);
    }
  };

  const iconPicked = (icon: string) => {
    // Make sure icon is a string
    if (icon === undefined || icon === null) return;

    // Add the icon to the message
    const newMessage = message + icon;
    setMessage(newMessage);

    // Notify parent component of the change
    if (props.change) {
      props.change(newMessage);
    }
  };

  const rows = props.schema?.rows || 4;
  const showSocialInput = props.schema?.hideSocialInput !== true;

  // Determine counter color class based on character count
  const getCounterClass = () => {
    if (!socialPlatform?.character_limit) return '';

    if (charCount > socialPlatform.character_limit) {
      return counterErrorClasses || 'text-red-500';
    } else if (charCount > socialPlatform.character_limit - 10) {
      return counterWarningClasses || 'text-yellow-500';
    } else {
      return counterClasses || 'text-green-500';
    }
  };

  return (
    <StyledComponent
      componentType="social-textarea"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("relative", props.className)}
      ref={containerRef}
    >
      <StyledComponent
        componentType="social-textarea"
        part="textarea"
        schema={props.schema}
        theme={props.theme}
        as="textarea"
        disabled={props.disabled || props.schema?.disabled}
        readOnly={props.readOnly || props.schema?.readOnly}
        value={message}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        name={props.name}
        id={props.id || props.path}
        rows={rows}
        placeholder={props.schema?.placeholder || 'Type your message here'}
        onKeyDown={handleKeyDown}
        className="block w-full rounded border-0 py-1.5 text-gray-900 bg-white/20 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-200 sm:text-sm sm:leading-5"
        ref={inputRef}
        aria-label={props.schema?.title || props.name || "Social media message"}
      />

      {showSocialInput && (
        <StyledComponent
          componentType="social-textarea"
          part="controls"
          schema={props.schema}
          theme={props.theme}
          className="text-sm flex gap-4 justify-between items-center border-b border-b-gray-200 mt-1 mb-2 px-1"
        >
          <StyledComponent
            componentType="social-textarea"
            part="platformSelector"
            schema={props.schema}
            theme={props.theme}
            className='w-64'
          >
            <SelectManyList
              value={socialPlatform?.key}
              theme={'minimal'}
              options={socialCharacterCounts.filter(p => p.popular).map(x => ({ label: x.platform + ' - ' + x.type, value: x.key, ...x }))}
              change={(value, item) => setSocialPlatform(item)}
              schema={props.schema}
              className={'bg-white w-64 p-2 [&>*]:p-2'}
            />
          </StyledComponent>
          <div className="flex-grow "></div>

          <StyledComponent
            componentType="social-textarea"
            part="iconPicker"
            schema={props.schema}
            theme={props.theme}
          >
            <IconPickerElement
              blur={iconPicked}
              schema={{ noSvg: true }}
            />
          </StyledComponent>

          <StyledComponent
            componentType="social-textarea"
            part="counter"
            schema={props.schema}
            theme={props.theme}
            className={twMerge("whitespace-nowrap", getCounterClass())}
          >
            <span>{charCount}</span>
            {socialPlatform && <span> / {socialPlatform.character_limit}</span>}
          </StyledComponent>
        </StyledComponent>
      )}

      {isOpen && (
        <StyledComponent
          componentType="social-textarea"
          part="suggestions"
          schema={props.schema}
          theme={props.theme}
          as="ul"
          className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <StyledComponent
              key={suggestion}
              componentType="social-textarea"
              part={index === selectedIndex ? "suggestionSelected" : "suggestionItem"}
              schema={props.schema}
              theme={props.theme}
              as="li"
              onClick={() => handleSuggestionClick(suggestion)}
              className={twMerge(
                "px-4 py-2 cursor-pointer hover:bg-gray-100",
                index === selectedIndex ? "bg-blue-50 text-blue-700" : ""
              )}
            >
              {suggestion}
            </StyledComponent>
          ))}
        </StyledComponent>
      )}
    </StyledComponent>
  );
};

const socialCharacterCounts = [
  {
    platform: 'Twitter (X)',
    type: 'Tweet (Standard)',
    character_limit: 280,
    key: 'twitter-tweet-standard',
    popular: true,
  },
  {
    platform: 'Twitter (X)',
    type: 'Tweet (Twitter Blue)',
    character_limit: 10000,
    key: 'twitter-tweet-twitter-blue',
  },
  {
    platform: 'Twitter (X)',
    type: 'Direct Message (DM)',
    character_limit: 10000,
    key: 'twitter-dm',
  },
  {
    platform: 'Twitter (X)',
    type: 'Ad Headline',
    character_limit: 70,
    key: 'twitter-ad-headline',
  },
  {
    platform: 'Twitter (X)',
    type: 'Ad Copy Text',
    character_limit: 280,
    key: 'twitter-ad-copy-text',
  },
  {
    platform: 'Facebook',
    type: 'Post',
    character_limit: 63206,
    key: 'facebook-post',
    popular: true,
  },
  {
    platform: 'Facebook',
    type: 'Ad Headline',
    character_limit: 40,
    key: 'facebook-ad-headline',
  },
  {
    platform: 'Facebook',
    type: 'Ad Link Description',
    character_limit: 30,
    key: 'facebook-ad-link-description',
  },
  {
    platform: 'Facebook',
    type: 'Ad Primary Text',
    character_limit: 125,
    key: 'facebook-ad-primary-text',
  },
  {
    platform: 'Facebook',
    type: 'Comment',
    character_limit: 8000,
    key: 'facebook-comment',
    popular: true,
  },
  {
    platform: 'Facebook',
    type: 'Messenger Message',
    character_limit: 20000,
    key: 'facebook-messenger-message',
  },
  {
    platform: 'Instagram',
    type: 'Caption',
    character_limit: 2200,
    key: 'instagram-caption',
    popular: true,
  },
  {
    platform: 'Instagram',
    type: 'Bio',
    character_limit: 150,
    key: 'instagram-bio',
  },
  {
    platform: 'Instagram',
    type: 'Direct Message (DM)',
    character_limit: 1000,
    key: 'instagram-dm',
  },
  {
    platform: 'Instagram',
    type: 'Comment',
    character_limit: 2200,
    key: 'instagram-comment',
    popular: true,
  },
  {
    platform: 'Instagram',
    type: 'Ad Primary Text',
    character_limit: 125,
    key: 'instagram-ad-primary-text',
  },
  {
    platform: 'Instagram',
    type: 'Ad Headline',
    character_limit: 40,
    key: 'instagram-ad-headline',
  },
  {
    platform: 'LinkedIn',
    type: 'Post',
    character_limit: 3000,
    key: 'linkedin-post',
    popular: true,
  },
  {
    platform: 'LinkedIn',
    type: 'Article',
    character_limit: 100000,
    key: 'linkedin-article',
  },
  {
    platform: 'LinkedIn',
    type: 'Direct Message (InMail)',
    character_limit: 1900,
    key: 'linkedin-inmail',
  },
  {
    platform: 'LinkedIn',
    type: 'Ad Intro Text',
    character_limit: 600,
    key: 'linkedin-ad-intro-text',
  },
  {
    platform: 'LinkedIn',
    type: 'Ad Headline',
    character_limit: 200,
    key: 'linkedin-ad-headline',
  },
  {
    platform: 'LinkedIn',
    type: 'Ad Description',
    character_limit: 300,
    key: 'linkedin-ad-description',
  },
  {
    platform: 'TikTok',
    type: 'Caption',
    character_limit: 2200,
    key: 'tiktok-caption',
    popular: true,
  },
  {
    platform: 'TikTok',
    type: 'Bio',
    character_limit: 80,
    key: 'tiktok-bio',
  },
  {
    platform: 'YouTube',
    type: 'Video Title',
    character_limit: 100,
    key: 'youtube-video-title',
    popular: true,
  },
  {
    platform: 'YouTube',
    type: 'Description',
    character_limit: 5000,
    key: 'youtube-description',
  },
  {
    platform: 'YouTube',
    type: 'Comment',
    character_limit: 10000,
    key: 'youtube-comment',
  },
  {
    platform: 'YouTube',
    type: 'Shorts Caption',
    character_limit: 100,
    key: 'youtube-shorts-caption',
  },
  {
    platform: 'YouTube',
    type: 'Community Post',
    character_limit: 5000,
    key: 'youtube-community-post',
  },
  {
    platform: 'Pinterest',
    type: 'Pin Title',
    character_limit: 100,
    key: 'pinterest-pin-title',
  },
  {
    platform: 'Pinterest',
    type: 'Pin Description',
    character_limit: 500,
    key: 'pinterest-pin-description',
  },
  {
    platform: 'Pinterest',
    type: 'Bio',
    character_limit: 160,
    key: 'pinterest-bio',
  },
  {
    platform: 'Reddit',
    type: 'Post Title',
    character_limit: 300,
    key: 'reddit-post-title',
  },
  {
    platform: 'Reddit',
    type: 'Post Body',
    character_limit: 40000,
    key: 'reddit-post-body',
  },
  {
    platform: 'Reddit',
    type: 'Comment',
    character_limit: 10000,
    key: 'reddit-comment',
  },
  {
    platform: 'Snapchat',
    type: 'Caption',
    character_limit: 80,
    key: 'snapchat-caption',
  },
  {
    platform: 'Snapchat',
    type: 'Ad Headline',
    character_limit: 34,
    key: 'snapchat-ad-headline',
  },
  {
    platform: 'WhatsApp',
    type: 'Status',
    character_limit: 700,
    key: 'whatsapp-status',
  },
  {
    platform: 'WhatsApp',
    type: 'Message',
    character_limit: 65536,
    key: 'whatsapp-message',
  },
];
