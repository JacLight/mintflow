import Joi from 'joi';

export const LogValidator = Joi.object({
    flowId: Joi.string().required(),
    runId: Joi.string().required(),
    nodeId: Joi.string().required(),
    logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').required(),
    message: Joi.string().required(),
    metadata: Joi.object().optional(),
});
