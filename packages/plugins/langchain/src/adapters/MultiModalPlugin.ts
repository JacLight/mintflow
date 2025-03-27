/**
 * MultiModal Plugin for LangChain
 * 
 * This plugin provides multimodal capabilities for processing text, images, and audio.
 */

import { loadImageFromFile, loadImageFromURL, loadAudioFromFile, loadAudioFromURL } from '../multimodal/index.js';
import { MultiModalChainFactory } from '../multimodal/MultiModalChain.js';
import { ComponentRegistry } from '../registry/ComponentRegistry.js';

/**
 * Options for loading images
 */
export interface ImageLoadOptions {
  /**
   * Whether to extract text from the image using OCR
   */
  extractText?: boolean;
  
  /**
   * Whether to detect objects in the image
   */
  detectObjects?: boolean;
  
  /**
   * Whether to generate a caption for the image
   */
  generateCaption?: boolean;
  
  /**
   * Whether to generate an embedding for the image
   */
  generateEmbedding?: boolean;
  
  /**
   * The maximum width of the image (will be resized if larger)
   */
  maxWidth?: number;
  
  /**
   * The maximum height of the image (will be resized if larger)
   */
  maxHeight?: number;
}

/**
 * Options for loading audio
 */
export interface AudioLoadOptions {
  /**
   * Whether to transcribe the audio to text
   */
  transcribe?: boolean;
  
  /**
   * Whether to detect the language in the audio
   */
  detectLanguage?: boolean;
  
  /**
   * Whether to perform speaker diarization
   */
  diarize?: boolean;
  
  /**
   * Whether to generate an embedding for the audio
   */
  generateEmbedding?: boolean;
}

/**
 * Options for multimodal processing
 */
export interface MultiModalOptions {
  /**
   * The language model to use
   */
  llm: string;
  
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
}

/**
 * MultiModal plugin for LangChain
 */
const multiModalPlugin = {
  name: 'MultiModal',
  icon: 'GiMagnifyingGlass',
  description: 'Process text, images, and audio with LLMs',
  id: 'multimodal',
  runner: 'node',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The text input'
      },
      imagePaths: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Paths to image files'
      },
      imageUrls: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'URLs of images'
      },
      audioPaths: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Paths to audio files'
      },
      audioUrls: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'URLs of audio files'
      },
      imageLoadOptions: {
        type: 'object',
        description: 'Options for loading images'
      },
      audioLoadOptions: {
        type: 'object',
        description: 'Options for loading audio'
      },
      llm: {
        type: 'string',
        description: 'The language model to use'
      },
      promptTemplate: {
        type: 'string',
        description: 'The prompt template to use'
      },
      includeImageCaptions: {
        type: 'boolean',
        description: 'Whether to include image captions in the prompt'
      },
      includeImageMetadata: {
        type: 'boolean',
        description: 'Whether to include image metadata in the prompt'
      },
      includeAudioTranscriptions: {
        type: 'boolean',
        description: 'Whether to include audio transcriptions in the prompt'
      },
      includeAudioMetadata: {
        type: 'boolean',
        description: 'Whether to include audio metadata in the prompt'
      },
      maxImages: {
        type: 'number',
        description: 'The maximum number of images to include'
      },
      maxAudio: {
        type: 'number',
        description: 'The maximum number of audio files to include'
      }
    },
    required: ['llm']
  },
  outputSchema: {
    type: 'object',
    properties: {
      response: {
        type: 'string',
        description: 'The response from the LLM'
      },
      prompt: {
        type: 'string',
        description: 'The prompt sent to the LLM'
      }
    }
  },
  documentation: 'https://js.langchain.com/docs/modules/model_io/models/chat/',
  method: 'exec',
  actions: [
    {
      name: 'Process Multimodal Input',
      description: 'Process text, images, and audio with an LLM',
      id: 'processMultimodalInput',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text input'
          },
          imagePaths: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Paths to image files'
          },
          imageUrls: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'URLs of images'
          },
          audioPaths: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Paths to audio files'
          },
          audioUrls: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'URLs of audio files'
          },
          imageLoadOptions: {
            type: 'object',
            description: 'Options for loading images'
          },
          audioLoadOptions: {
            type: 'object',
            description: 'Options for loading audio'
          },
          llm: {
            type: 'string',
            description: 'The language model to use'
          },
          promptTemplate: {
            type: 'string',
            description: 'The prompt template to use'
          },
          includeImageCaptions: {
            type: 'boolean',
            description: 'Whether to include image captions in the prompt'
          },
          includeImageMetadata: {
            type: 'boolean',
            description: 'Whether to include image metadata in the prompt'
          },
          includeAudioTranscriptions: {
            type: 'boolean',
            description: 'Whether to include audio transcriptions in the prompt'
          },
          includeAudioMetadata: {
            type: 'boolean',
            description: 'Whether to include audio metadata in the prompt'
          },
          maxImages: {
            type: 'number',
            description: 'The maximum number of images to include'
          },
          maxAudio: {
            type: 'number',
            description: 'The maximum number of audio files to include'
          }
        },
        required: ['llm']
      },
      outputSchema: {
        type: 'object',
        properties: {
          response: {
            type: 'string',
            description: 'The response from the LLM'
          },
          prompt: {
            type: 'string',
            description: 'The prompt sent to the LLM'
          }
        }
      },
      async exec(input: {
        text?: string;
        imagePaths?: string[];
        imageUrls?: string[];
        audioPaths?: string[];
        audioUrls?: string[];
        imageLoadOptions?: ImageLoadOptions;
        audioLoadOptions?: AudioLoadOptions;
        llm: string;
        promptTemplate?: string;
        includeImageCaptions?: boolean;
        includeImageMetadata?: boolean;
        includeAudioTranscriptions?: boolean;
        includeAudioMetadata?: boolean;
        maxImages?: number;
        maxAudio?: number;
      }) {
        try {
          // Get the LLM from the registry
          const registry = ComponentRegistry.getInstance();
          const llmFactory = registry.getComponentFactory(input.llm);
          const llm = await llmFactory.create({});
          
          // Load images from paths
          const imagePathPromises = (input.imagePaths || []).map(path => 
            loadImageFromFile(path, input.imageLoadOptions)
          );
          
          // Load images from URLs
          const imageUrlPromises = (input.imageUrls || []).map(url => 
            loadImageFromURL(url, input.imageLoadOptions)
          );
          
          // Load audio from paths
          const audioPathPromises = (input.audioPaths || []).map(path => 
            loadAudioFromFile(path, input.audioLoadOptions)
          );
          
          // Load audio from URLs
          const audioUrlPromises = (input.audioUrls || []).map(url => 
            loadAudioFromURL(url, input.audioLoadOptions)
          );
          
          // Wait for all promises to resolve
          const [imagesFromPaths, imagesFromUrls, audioFromPaths, audioFromUrls] = await Promise.all([
            Promise.all(imagePathPromises),
            Promise.all(imageUrlPromises),
            Promise.all(audioPathPromises),
            Promise.all(audioUrlPromises)
          ]);
          
          // Combine images and audio
          const images = [...imagesFromPaths, ...imagesFromUrls];
          const audio = [...audioFromPaths, ...audioFromUrls];
          
          // Create the multimodal chain
          const chain = MultiModalChainFactory.create({
            llm,
            promptTemplate: input.promptTemplate,
            includeImageCaptions: input.includeImageCaptions,
            includeImageMetadata: input.includeImageMetadata,
            includeAudioTranscriptions: input.includeAudioTranscriptions,
            includeAudioMetadata: input.includeAudioMetadata,
            maxImages: input.maxImages,
            maxAudio: input.maxAudio
          });
          
          // Run the chain
          const result = await chain.call({
            text: input.text,
            images,
            audio
          });
          
          return {
            response: result.output,
            prompt: result.prompt
          };
        } catch (error: any) {
          console.error('Error processing multimodal input:', error);
          throw new Error(`Failed to process multimodal input: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Load Image',
      description: 'Load an image from a file or URL',
      id: 'loadImage',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the image file'
          },
          url: {
            type: 'string',
            description: 'URL of the image'
          },
          options: {
            type: 'object',
            description: 'Options for loading the image'
          }
        },
        oneOf: [
          { required: ['path'] },
          { required: ['url'] }
        ]
      },
      outputSchema: {
        type: 'object',
        properties: {
          image: {
            type: 'object',
            description: 'The loaded image'
          }
        }
      },
      async exec(input: {
        path?: string;
        url?: string;
        options?: ImageLoadOptions;
      }) {
        try {
          if (input.path) {
            const image = await loadImageFromFile(input.path, input.options);
            return { image };
          } else if (input.url) {
            const image = await loadImageFromURL(input.url, input.options);
            return { image };
          } else {
            throw new Error('Either path or url must be provided');
          }
        } catch (error: any) {
          console.error('Error loading image:', error);
          throw new Error(`Failed to load image: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Load Audio',
      description: 'Load an audio file from a file or URL',
      id: 'loadAudio',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the audio file'
          },
          url: {
            type: 'string',
            description: 'URL of the audio file'
          },
          options: {
            type: 'object',
            description: 'Options for loading the audio'
          }
        },
        oneOf: [
          { required: ['path'] },
          { required: ['url'] }
        ]
      },
      outputSchema: {
        type: 'object',
        properties: {
          audio: {
            type: 'object',
            description: 'The loaded audio'
          }
        }
      },
      async exec(input: {
        path?: string;
        url?: string;
        options?: AudioLoadOptions;
      }) {
        try {
          if (input.path) {
            const audio = await loadAudioFromFile(input.path, input.options);
            return { audio };
          } else if (input.url) {
            const audio = await loadAudioFromURL(input.url, input.options);
            return { audio };
          } else {
            throw new Error('Either path or url must be provided');
          }
        } catch (error: any) {
          console.error('Error loading audio:', error);
          throw new Error(`Failed to load audio: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default multiModalPlugin;
// These types are already defined in this file, so we don't need to re-export them
// // Types are already exported above
