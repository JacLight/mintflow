import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const getFormResponses = {
    name: 'get_form_responses',
    displayName: 'Get Google Form Responses',
    ...commonSchema,
    inputSchema: {
        type: "object",
        required: ["auth", "formId"],
        properties: {
            auth: {
                type: "object",
                required: ["access_token"],
                properties: {
                    access_token: {
                        type: "string",
                        description: "OAuth2 access token with Google Forms permissions"
                    }
                }
            },
            formId: {
                type: "string",
                description: "ID of the Google Form"
            },
            includeResponses: {
                type: "boolean",
                description: "Whether to include the form responses in the result",
                default: true
            },
            limit: {
                type: "number",
                description: "Maximum number of responses to return (0 for all)",
                default: 0
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            formId: {
                type: "string",
                description: "ID of the form"
            },
            formTitle: {
                type: "string",
                description: "Title of the form"
            },
            formUrl: {
                type: "string",
                description: "URL to access the form"
            },
            responseCount: {
                type: "number",
                description: "Total number of responses"
            },
            questions: {
                type: "array",
                description: "List of questions in the form",
                items: {
                    type: "object",
                    properties: {
                        questionId: {
                            type: "string",
                            description: "ID of the question"
                        },
                        title: {
                            type: "string",
                            description: "Question title/text"
                        },
                        type: {
                            type: "string",
                            description: "Type of question (e.g., TEXT, MULTIPLE_CHOICE)"
                        }
                    }
                }
            },
            responses: {
                type: "array",
                description: "List of form responses",
                items: {
                    type: "object",
                    properties: {
                        responseId: {
                            type: "string",
                            description: "ID of the response"
                        },
                        createTime: {
                            type: "string",
                            description: "Time when the response was created"
                        },
                        answers: {
                            type: "object",
                            description: "Answers to the questions, keyed by question ID"
                        }
                    }
                }
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        formId: '1FAIpQLSdg5LQwER3dFGhIjKlMnOpQrStUvWxYz',
        includeResponses: true,
        limit: 10
    },
    exampleOutput: {
        formId: '1FAIpQLSdg5LQwER3dFGhIjKlMnOpQrStUvWxYz',
        formTitle: 'Customer Feedback Survey',
        formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdg5LQwER3dFGhIjKlMnOpQrStUvWxYz/viewform',
        responseCount: 25,
        questions: [
            {
                questionId: '12345',
                title: 'How would you rate our service?',
                type: 'SCALE'
            },
            {
                questionId: '67890',
                title: 'Any additional comments?',
                type: 'TEXT'
            }
        ],
        responses: [
            {
                responseId: 'response1',
                createTime: '2023-01-15T10:00:00.000Z',
                answers: {
                    '12345': {
                        textAnswers: {
                            answers: [{ value: '5' }]
                        }
                    },
                    '67890': {
                        textAnswers: {
                            answers: [{ value: 'Great service, very satisfied!' }]
                        }
                    }
                }
            }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, formId, includeResponses = true, limit = 0 } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // The Forms API base URL
            const formsApiUrl = 'https://forms.googleapis.com/v1/forms';

            // Get form metadata
            const formResponse = await axios.get(
                `${formsApiUrl}/${formId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`
                    }
                }
            );

            const form = formResponse.data;

            // Extract questions from the form
            const questions = form.items ? form.items.map((item: any) => {
                const questionItem = item.questionItem || {};
                const question = questionItem.question || {};

                return {
                    questionId: item.itemId,
                    title: item.title,
                    type: question.questionType
                };
            }) : [];

            // Prepare the result
            const result: any = {
                formId: form.formId,
                formTitle: form.info ? form.info.title : 'Unknown',
                formUrl: form.responderUri,
                responseCount: form.responseCount || 0,
                questions
            };

            // Get form responses if requested
            if (includeResponses) {
                const responsesResponse = await axios.get(
                    `${formsApiUrl}/${formId}/responses`,
                    {
                        headers: {
                            'Authorization': `Bearer ${auth.access_token}`
                        }
                    }
                );

                let responses = responsesResponse.data.responses || [];

                // Apply limit if specified
                if (limit > 0 && responses.length > limit) {
                    responses = responses.slice(0, limit);
                }

                result.responses = responses.map((response: any) => ({
                    responseId: response.responseId,
                    createTime: response.createTime,
                    answers: response.answers
                }));
            }

            return result;
        } catch (error: any) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
