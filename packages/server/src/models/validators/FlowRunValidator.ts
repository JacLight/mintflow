import Joi from 'joi';

export const FlowRunValidator = Joi.object({
    flowId: Joi.string().required(),
    tenantId: Joi.string().required(),
    status: Joi.string().valid('pending', 'running', 'completed', 'failed', 'waiting').required(),
    logs: Joi.array().items(Joi.string()).optional(),
    nodeStates: Joi.array().items(Joi.object({
        nodeId: Joi.string().required(),
        status: Joi.string().valid('pending', 'running', 'completed', 'failed', 'waiting').required(),
        logs: Joi.array().items(Joi.string()).optional(),
        result: Joi.any().optional(),
        startedAt: Joi.date().optional(),
        finishedAt: Joi.date().optional(),
    })).optional(),
    startedAt: Joi.date().optional(),
    finishedAt: Joi.date().optional(),
});
