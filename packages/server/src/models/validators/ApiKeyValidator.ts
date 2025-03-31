import Joi from 'joi';

export const ApiKeyValidator = Joi.object({
    apiKeyId: Joi.string().optional(),
    name: Joi.string().required().min(3).max(50),
    prefix: Joi.string().optional(),
    fullKey: Joi.string().optional(),
    created: Joi.date().optional(),
    workspace: Joi.string().required(),
    environment: Joi.string().valid('Production', 'Development').required(),
    lastUsed: Joi.date().optional().allow(null),
    tenantId: Joi.string().required()
});
