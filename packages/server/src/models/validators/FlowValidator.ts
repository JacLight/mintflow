import Joi from 'joi';

export const FlowValidator = Joi.object({
    tenantId: Joi.string().required(),
    definition: Joi.object().required(), // Ensures a valid JSON structure
    overallStatus: Joi.string().valid('draft', 'running', 'paused', 'completed', 'failed')
});
