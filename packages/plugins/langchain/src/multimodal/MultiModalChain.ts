/**
 * MultiModalChain for processing both text and multimodal inputs
 */

import { BaseChain } from '../chains/index.js';
import { LLM } from '../chains/LLMChain.js';
import { LoadedImage } from './ImageLoader.js';
import { LoadedAudio } from './AudioLoader.js';

/**
 * Input for the MultiModalChain
 */
export interface MultiModalInput {
  /**
   * The text input
   */
  text?: string;
  
  /**
   * The image inputs
   */
  images?: LoadedImage[];
  
  /**
   * The audio inputs
   */
  audio?: LoadedAudio[];
}

/**
 * Options for the MultiModalChain
 */
export interface MultiModalChainOptions {
  /**
   * The language model to use
   */
  llm: LLM;
  
  /**
   * The prompt template to use
   */
  promptTemplate?: string;
  
  /**
   * Whether to include image captions in the prompt
   */
  includeImageCaptions?: boolean;
  
  /**
   * Whether to include image metadata in the prompt
   */
  includeImageMetadata?: boolean;
  
  /**
   * Whether to include audio transcriptions in the prompt
   */
  includeAudioTranscriptions?: boolean;
  
  /**
   * Whether to include audio metadata in the prompt
   */
  includeAudioMetadata?: boolean;
  
  /**
   * The maximum number of images to include
   */
  maxImages?: number;
  
  /**
   * The maximum number of audio files to include
   */
  maxAudio?: number;
  
  /**
   * Optional callback to call with the formatted prompt before sending to the LLM
   */
  onPrompt?: (prompt: string) => void;
  
  /**
   * Optional callback to call with the raw LLM output
   */
  onOutput?: (output: string) => void;
}

/**
 * Chain for processing both text and multimodal inputs
 */
export class MultiModalChain implements BaseChain {
  /**
   * The language model to use
   */
  private llm: LLM;
  
  /**
   * The prompt template to use
   */
  private promptTemplate: string;
  
  /**
   * Whether to include image captions in the prompt
   */
  private includeImageCaptions: boolean;
  
  /**
   * Whether to include image metadata in the prompt
   */
  private includeImageMetadata: boolean;
  
  /**
   * Whether to include audio transcriptions in the prompt
   */
  private includeAudioTranscriptions: boolean;
  
  /**
   * Whether to include audio metadata in the prompt
   */
  private includeAudioMetadata: boolean;
  
  /**
   * The maximum number of images to include
   */
  private maxImages: number;
  
  /**
   * The maximum number of audio files to include
   */
  private maxAudio: number;
  
  /**
   * Optional callback to call with the formatted prompt before sending to the LLM
   */
  private onPrompt?: (prompt: string) => void;
  
  /**
   * Optional callback to call with the raw LLM output
   */
  private onOutput?: (output: string) => void;
  
  /**
   * Create a new MultiModalChain
   * 
   * @param options Options for the MultiModalChain
   */
  constructor(options: MultiModalChainOptions) {
    this.llm = options.llm;
    this.promptTemplate = options.promptTemplate || 
      'You are an assistant that can understand both text and images.\n\n' +
      'User Query: {text}\n\n' +
      '{image_descriptions}\n\n' +
      '{audio_descriptions}\n\n' +
      'Please provide a detailed response based on the text and any provided images or audio.';
    
    this.includeImageCaptions = options.includeImageCaptions ?? true;
    this.includeImageMetadata = options.includeImageMetadata ?? false;
    this.includeAudioTranscriptions = options.includeAudioTranscriptions ?? true;
    this.includeAudioMetadata = options.includeAudioMetadata ?? false;
    this.maxImages = options.maxImages ?? 5;
    this.maxAudio = options.maxAudio ?? 3;
    this.onPrompt = options.onPrompt;
    this.onOutput = options.onOutput;
  }
  
  /**
   * Generate image descriptions
   * 
   * @param images The images to describe
   * @returns The image descriptions
   */
  private generateImageDescriptions(images: LoadedImage[]): string {
    if (!images || images.length === 0) {
      return '';
    }
    
    const limitedImages = images.slice(0, this.maxImages);
    const descriptions: string[] = [];
    
    for (let i = 0; i < limitedImages.length; i++) {
      const image = limitedImages[i];
      const parts: string[] = [];
      
      parts.push(`Image ${i + 1}:`);
      
      if (this.includeImageCaptions && image.caption) {
        parts.push(`Caption: ${image.caption}`);
      }
      
      if (image.text) {
        parts.push(`Text in image: ${image.text}`);
      }
      
      if (image.objects && image.objects.length > 0) {
        const objectCounts: Record<string, number> = {};
        
        for (const object of image.objects) {
          objectCounts[object.label] = (objectCounts[object.label] || 0) + 1;
        }
        
        const objectDescriptions = Object.entries(objectCounts)
          .map(([label, count]) => `${count} ${label}${count > 1 ? 's' : ''}`)
          .join(', ');
        
        parts.push(`Objects detected: ${objectDescriptions}`);
      }
      
      if (this.includeImageMetadata) {
        parts.push(`Dimensions: ${image.metadata.width}x${image.metadata.height}`);
        parts.push(`Format: ${image.metadata.format}`);
      }
      
      descriptions.push(parts.join('\n'));
    }
    
    if (images.length > this.maxImages) {
      descriptions.push(`Note: ${images.length - this.maxImages} additional images were not processed due to the limit.`);
    }
    
    return descriptions.join('\n\n');
  }
  
  /**
   * Generate audio descriptions
   * 
   * @param audioFiles The audio files to describe
   * @returns The audio descriptions
   */
  private generateAudioDescriptions(audioFiles: LoadedAudio[]): string {
    if (!audioFiles || audioFiles.length === 0) {
      return '';
    }
    
    const limitedAudio = audioFiles.slice(0, this.maxAudio);
    const descriptions: string[] = [];
    
    for (let i = 0; i < limitedAudio.length; i++) {
      const audio = limitedAudio[i];
      const parts: string[] = [];
      
      parts.push(`Audio ${i + 1}:`);
      
      if (this.includeAudioTranscriptions && audio.text) {
        parts.push(`Transcription: ${audio.text}`);
      }
      
      if (audio.language) {
        parts.push(`Language: ${audio.language}`);
      }
      
      if (audio.speakers && audio.speakers.length > 0) {
        for (const speaker of audio.speakers) {
          const speakerParts: string[] = [];
          
          for (const segment of speaker.segments) {
            speakerParts.push(`[${segment.start.toFixed(2)}s - ${segment.end.toFixed(2)}s]: ${segment.text}`);
          }
          
          parts.push(`Speaker ${speaker.id}:\n${speakerParts.join('\n')}`);
        }
      }
      
      if (this.includeAudioMetadata) {
        parts.push(`Duration: ${audio.metadata.duration.toFixed(2)} seconds`);
        parts.push(`Format: ${audio.metadata.format}`);
        parts.push(`Channels: ${audio.metadata.channels}`);
        parts.push(`Sample Rate: ${audio.metadata.sampleRate} Hz`);
      }
      
      descriptions.push(parts.join('\n'));
    }
    
    if (audioFiles.length > this.maxAudio) {
      descriptions.push(`Note: ${audioFiles.length - this.maxAudio} additional audio files were not processed due to the limit.`);
    }
    
    return descriptions.join('\n\n');
  }
  
  /**
   * Format the prompt
   * 
   * @param input The input
   * @returns The formatted prompt
   */
  private formatPrompt(input: MultiModalInput): string {
    const imageDescriptions = this.generateImageDescriptions(input.images || []);
    const audioDescriptions = this.generateAudioDescriptions(input.audio || []);
    
    return this.promptTemplate
      .replace('{text}', input.text || '')
      .replace('{image_descriptions}', imageDescriptions ? `Image Descriptions:\n${imageDescriptions}` : '')
      .replace('{audio_descriptions}', audioDescriptions ? `Audio Descriptions:\n${audioDescriptions}` : '');
  }
  
  /**
   * Run the chain with the given input values
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain
   */
  async run(input: Record<string, any>, options?: any): Promise<any> {
    const multiModalInput: MultiModalInput = {
      text: input.text as string,
      images: input.images as LoadedImage[],
      audio: input.audio as LoadedAudio[]
    };
    
    // Format the prompt
    const prompt = this.formatPrompt(multiModalInput);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    const output = await this.llm.complete(prompt, options);
    
    // Call the onOutput callback if provided
    if (this.onOutput) {
      this.onOutput(output);
    }
    
    return output;
  }
  
  /**
   * Run the chain with the given input values and return the output with additional metadata
   * 
   * @param input Input values for the chain
   * @param options Optional parameters for the chain
   * @returns The output of the chain with additional metadata
   */
  async call(input: Record<string, any>, options?: any): Promise<{ output: any; prompt: string; rawOutput: string }> {
    const multiModalInput: MultiModalInput = {
      text: input.text as string,
      images: input.images as LoadedImage[],
      audio: input.audio as LoadedAudio[]
    };
    
    // Format the prompt
    const prompt = this.formatPrompt(multiModalInput);
    
    // Call the onPrompt callback if provided
    if (this.onPrompt) {
      this.onPrompt(prompt);
    }
    
    // Run the LLM
    const rawOutput = await this.llm.complete(prompt, options);
    
    // Call the onOutput callback if provided
    if (this.onOutput) {
      this.onOutput(rawOutput);
    }
    
    // Return the output with additional metadata
    return {
      output: rawOutput,
      prompt,
      rawOutput
    };
  }
}

/**
 * Factory for creating MultiModalChain instances
 */
export class MultiModalChainFactory {
  /**
   * Create a new MultiModalChain
   * 
   * @param options Options for the chain
   * @returns A new MultiModalChain instance
   */
  static create(options: MultiModalChainOptions): MultiModalChain {
    return new MultiModalChain(options);
  }
}
