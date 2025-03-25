import type {
  CoreAssistantMessage,
  CoreToolMessage,
  Message,
  TextStreamPart,
  ToolInvocation,
  ToolSet,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Message as DBMessage, Document } from '@/src/lib/db/schema';


interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: 'result',
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    let reasoning: string | undefined = undefined;
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        } else if (content.type === 'reasoning') {
          reasoning = content.reasoning;
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      reasoning,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function sanitizeResponseMessages({
  messages,
  reasoning,
}: {
  messages: Array<ResponseMessage>;
  reasoning: string | undefined;
}) {
  const toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
          ? content.text.length > 0
          : true,
    );

    if (reasoning) {
      // @ts-expect-error: reasoning message parts in sdk is wip
      sanitizedContent.push({ type: 'reasoning', reasoning });
    }

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0,
  );
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];

    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === 'result') {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === 'result' ||
        toolResultIds.includes(toolInvocation.toolCallId),
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0),
  );
}

export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}



export const toTitleCase = (str: string) => {
  if (!str) return str;
  if (typeof str !== 'string') return str;

  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const toSentenceCase = (str: string) => {
  if (!str || typeof str !== 'string') return str;

  // Match an uppercase letter that is followed by a lowercase letter or preceded by a lowercase letter.
  const result = str.replace(/([a-z])([A-Z])|([A-Z])([A-Z][a-z])/g, (_, p1, p2, p3, p4) => {
    return p1 && p2 ? `${p1} ${p2}` : `${p3} ${p4}`;
  });

  // Capitalize the first character and return the result
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const deepCopy = (obj: any) => {
  if (!obj) return obj;
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
};


export const deepCopySimple = (obj: any) => {
  if (!obj) return obj;
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  let clonedObj: any = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      clonedObj[key] = deepCopySimple(value);
    }
  }
  return clonedObj;
};

export const isEmpty = (obj: any) => {
  if (typeof obj === 'undefined') return true;
  if (typeof obj === null) return true;
  if (typeof obj === 'function') return false;
  if (typeof obj === 'boolean' || typeof obj === 'number') return false;
  if (typeof obj === 'string' && obj.length > 0) return false;
  if (Array.isArray(obj) && obj.length > 0) return false;
  if (obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0)
    return false;
  return true;
};

export const isNotEmpty = (obj: any) => {
  return !isEmpty(obj);
}

export const validUrl = (url: string) => {
  if (!url) return false;
  var pattern = new RegExp('^https?:\\/\\/'); // fragment locator
  return !!pattern.test(url);
};

export function getRandomNumber(min = 0, max = 999999) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomString(length = 20) {
  const chars = 'abcdefghijklmnpqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = chars + numbers;

  let result = chars.charAt(Math.floor(Math.random() * chars.length)); // Start with a character

  for (let i = 1; i < length; i++) { // Start loop from 1 since we already have the first character
    result += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return result;
}

export const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
}

export function removeEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    // If it's an array, apply removeEmpty to each element
    return obj.map(removeEmpty).filter(v => v != null);
  } else if (obj !== null && typeof obj === 'object') {
    // If it's an object, apply the original logic
    return Object.entries(obj)
      .filter(([_, v]) => v != null)
      .reduce(
        (acc, [k, v]) => ({ ...acc, [k]: v === Object(v) ? removeEmpty(v) : v }),
        {}
      );
  }
  // Return the value as is if it's neither an array nor an object
  return obj;
}

export const randomNumber = (length: number) => {
  var arr = [];
  while (arr.length < length) {
    var r = Math.floor(Math.random() * 100) + 1;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr.join();
};

export const isArrayString = (str: any) => {
  if (typeof str !== 'string') return false;
  return str && str.startsWith('[') && str.endsWith(']');
};

export const isObjectString = (str: any) => {
  if (typeof str !== 'string') return false;
  return str && str.startsWith('{') && str.endsWith('}');
};

export const isJsonString = (str: any) => {
  return isArrayString(str) || isObjectString(str);
};

export const niceURI = (crappyURI: any) => {
  return crappyURI?.toLowerCase().replace(/[^a-zA-Z0-9-_\/]/g, '-');
};

export function findNestedKey(obj: any, key: string | number): any {
  if (obj && typeof obj === 'object') {
    if (obj.hasOwnProperty(key)) {
      return obj[key];
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = findNestedKey(obj[i], key);
        if (result !== undefined) {
          return result;
        }
      }
    } else {
      for (let prop in obj) {
        const result = findNestedKey(obj[prop], key);
        if (result !== undefined) {
          return result;
        }
      }
    }
  }
  return undefined;
}

export function timeAgo(createdDateTime: string): string {
  const now = new Date();
  const createdDate = new Date(createdDateTime);

  const diffInSeconds = Math.abs(now.getTime() - createdDate.getTime()) / 1000;

  const days = Math.floor(diffInSeconds / (60 * 60 * 24));
  const hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(diffInSeconds % 60);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
}

export function getTimePart(date: any) {
  if (typeof date === 'string') date = new Date(date);
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const amPm = hours24 < 12 ? 'AM' : 'PM';

  const formattedHours = String(hours12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${amPm}`;
}

export function formatTime(date: any) {
  if (typeof date === 'string') date = new Date(date);
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const amPm = hours24 < 12 ? 'AM' : 'PM';

  const formattedHours = String(hours12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${amPm}`;
}

interface AnyObject {
  [key: string]: any;
}

export function combineObjectArray(arr1: AnyObject[], arr2: AnyObject[], uniqueKey: string): AnyObject[] {
  if (!arr1) return arr2;
  if (!arr2) return arr1;
  return Array.from(
    [...arr1, ...arr2].reduce((acc, obj) => {
      return acc.set(obj[uniqueKey], obj);
    }, new Map<any, any>()).values()
  );
}

export function classNames(...classes: any) {
  return twMerge(classes.filter(Boolean).join(' '))
}

export function stringifyCSSObject(cssObject: any, indent = '') {
  let result = '';
  for (const [key, value] of Object.entries(cssObject)) {
    if (typeof value === 'object') {
      result += `${indent}${key}: {\n${stringifyCSSObject(value, indent + '  ')}${indent}}\n`;
    } else {
      result += `${indent}${key}: ${value};\n`;
    }
  }
  return result;
}


export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return emailRegex.test(email);
}

//camelCase to kebab-case
export const styleObjectToString = (style: { [key: string]: string }) => {
  return Object.keys(style).map(key => {
    const kebabCaseKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    return `${kebabCaseKey}:${style[key]}`;
  }
  ).join(';');
}

export const debounce = (func: any, wait: number) => {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const isValidHtmlId = (id: string) => {
  if (!id || typeof id !== 'string') return false;
  const idPattern = /^[A-Za-z][\w\:\-\.]*$/;
  return idPattern.test(id);
}

export const getResponseErrorMessage = (e: any) => {
  if (!e) return;
  if (e.constructor.name !== 'AxiosError') return e.message;
  let errMsg = e.response?.data?.message || e.response?.data?.error;
  let errPath = e.response?.data?.path;
  let message = errMsg + ' ' + errPath + ' ' + e.message;
  if (message.indexOf('/') > 1) {
    message = message.split('/')[0];
  }
  return message;
};