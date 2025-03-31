import Joi from 'joi';

export const UsageMetricsValidator = Joi.object({
    usageId: Joi.string().optional(),
    tenantId: Joi.string().required(),
    totalRequests: Joi.number().min(0).default(0),
    totalTokens: Joi.number().min(0).default(0),
    requestsByModel: Joi.object().pattern(
        Joi.string(),
        Joi.number().min(0)
    ).default({}),
    tokensByModel: Joi.object().pattern(
        Joi.string(),
        Joi.number().min(0)
    ).default({}),
    period: Joi.string().valid('daily', 'weekly', 'monthly').required(),
    date: Joi.date().default(Date.now)
});
