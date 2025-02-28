import * as actions from './actions/index.js';
import { validateApiKey } from './common.js';

const assemblyaiPlugin = {
    name: "assemblyai",
    icon: "https://www.assemblyai.com/favicon.ico",
    description: "Advanced speech recognition and audio intelligence using AssemblyAI",
    id: "assemblyai",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "AssemblyAI API key"
            }
        },
        required: ["apiKey"]
    },
    outputSchema: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                description: "Whether the operation was successful"
            },
            message: {
                type: "string",
                description: "Status message"
            }
        }
    },
    exampleInput: {
        apiKey: "your-assemblyai-api-key"
    },
    exampleOutput: {
        success: true,
        message: "Operation completed successfully"
    },
    documentation: "https://www.assemblyai.com/docs",
    method: "exec",
    actions: [
        {
            name: "transcribe",
            description: "Transcribe audio to text using AssemblyAI",
            runner: actions.transcribe,
            inputSchema: {
                type: "object",
                properties: {
                    apiKey: {
                        type: "string",
                        description: "AssemblyAI API key"
                    },
                    audioUrl: {
                        type: "string",
                        description: "URL of the audio file to transcribe"
                    },
                    audioData: {
                        type: "string",
                        description: "Base64-encoded audio data"
                    },
                    audioMimeType: {
                        type: "string",
                        description: "MIME type of the audio data"
                    },
                    language: {
                        type: "string",
                        description: "Language code (e.g., 'en', 'fr', 'es')"
                    },
                    speakerLabels: {
                        type: "boolean",
                        description: "Enable speaker diarization"
                    },
                    sentimentAnalysis: {
                        type: "boolean",
                        description: "Enable sentiment analysis"
                    },
                    entityDetection: {
                        type: "boolean",
                        description: "Enable entity detection"
                    },
                    waitUntilReady: {
                        type: "boolean",
                        description: "Wait until transcription is complete"
                    }
                },
                required: ["apiKey"],
                oneOf: [
                    { required: ["audioUrl"] },
                    { required: ["audioData"] }
                ]
            }
        },
        {
            name: "lemurTask",
            description: "Run a LeMUR task to analyze transcripts with AI",
            runner: actions.lemurTask,
            inputSchema: {
                type: "object",
                properties: {
                    apiKey: {
                        type: "string",
                        description: "AssemblyAI API key"
                    },
                    transcriptIds: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "Array of transcript IDs to analyze"
                    },
                    prompt: {
                        type: "string",
                        description: "The prompt for LeMUR to analyze the transcripts"
                    },
                    context: {
                        type: "string",
                        description: "Additional context for the LeMUR task"
                    },
                    final_model: {
                        type: "string",
                        description: "The LLM model to use for the final response"
                    },
                    max_output_size: {
                        type: "number",
                        description: "Maximum number of tokens in the response"
                    },
                    temperature: {
                        type: "number",
                        description: "Temperature for the LLM (0.0 to 1.0)"
                    }
                },
                required: ["apiKey", "transcriptIds", "prompt"]
            }
        },
        {
            name: "getTranscriptStatus",
            description: "Get the status of a transcription",
            runner: actions.getTranscriptStatus,
            inputSchema: {
                type: "object",
                properties: {
                    apiKey: {
                        type: "string",
                        description: "AssemblyAI API key"
                    },
                    transcriptId: {
                        type: "string",
                        description: "ID of the transcript to check"
                    }
                },
                required: ["apiKey", "transcriptId"]
            }
        }
    ],
    validateCredentials: async (credentials: { apiKey: string }) => {
        try {
            const isValid = await validateApiKey(credentials.apiKey);
            return {
                valid: isValid,
                message: isValid ? "API key is valid" : "Invalid API key"
            };
        } catch (error) {
            return {
                valid: false,
                message: "Error validating API key"
            };
        }
    }
};

export default assemblyaiPlugin;
