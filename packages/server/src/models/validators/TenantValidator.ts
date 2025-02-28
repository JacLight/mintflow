import Joi from 'joi';

export const TenantValidator = Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});
