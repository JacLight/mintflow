import { PluginDescriptor } from "@mintflow/common";
import { GoogleGenerativeAI } from "@google/generative-ai";

const googleAiPlugin: PluginDescriptor = {
    name: "Google AI",
    icon: "TbBrandGoogle",
    description: "Integration with Google Generative AI for text and image generation",
    id: "google-ai",
    runner: "node",
    type: 'node',
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Google AI API Key"
            },
            model: {
                type: "string",
                description: "Model to use (e.g., gemini-pro, gemini-pro-vision)",
                default: "gemini-pro"
            },
            prompt: {
                type: "string",
                description: "Text prompt for generation"
            },
            temperature: {
                type: "number",
                description: "Controls randomness (0.0-1.0)",
                default: 0.7
            },
            maxOutputTokens: {
                type: "number",
                description: "Maximum number of tokens to generate",
                default: 1024
            },
            topK: {
                type: "number",
                description: "Number of highest probability tokens to consider",
                default: 40
            },
            topP: {
                type: "number",
                description: "Probability threshold for token selection",
                default: 0.95
            }
        },
        required: ["apiKey", "prompt"]
    },
    outputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "Generated text response"
            }
        }
    },
    exampleInput: {
        apiKey: "YOUR_GOOGLE_AI_API_KEY",
        model: "gemini-pro",
        prompt: "Write a short poem about technology",
        temperature: 0.7,
        maxOutputTokens: 1024
    },
    exampleOutput: {
        text: "Digital dreams in silicon sleep,\nBinary whispers, secrets keep.\nConnected minds across the void,\nHuman and machine, forever employed.\nIn the dance of progress, hand in hand,\nTechnology transforms the promised land."
    },
    documentation: "https://ai.google.dev/docs",
    actions: [
        {
            name: "generate_text",
            execute: async (input: any): Promise<any> => {
                try {
                    const { apiKey, model, prompt, temperature, maxOutputTokens, topK, topP } = input;

                    if (!apiKey || !prompt) {
                        throw new Error("API key and prompt are required");
                    }

                    // Initialize the Google AI client
                    const genAI = new GoogleGenerativeAI(apiKey);

                    // Get the model
                    const modelInstance = genAI.getGenerativeModel({
                        model: model || "gemini-pro",
                        generationConfig: {
                            temperature: temperature !== undefined ? temperature : 0.7,
                            maxOutputTokens: maxOutputTokens || 1024,
                            topK: topK || 40,
                            topP: topP || 0.95,
                        },
                    });

                    // Generate content
                    const result = await modelInstance.generateContent(prompt);
                    const response = result.response;
                    const text = response.text();

                    return { text };
                } catch (error: any) {
                    console.error("Error generating text with Google AI:", error);
                    return {
                        error: true,
                        message: error.message || "Unknown error occurred"
                    };
                }
            }
        }
    ]
};

export default googleAiPlugin;
