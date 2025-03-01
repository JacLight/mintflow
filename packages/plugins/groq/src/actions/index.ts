import { askAi } from './ask-ai.js';
import { transcribeAudio } from './transcribe-audio.js';
import { translateAudio } from './translate-audio.js';
import { customApiCall } from './custom-api-call.js';

export const actions = [
  askAi,
  transcribeAudio,
  translateAudio,
  customApiCall,
];
