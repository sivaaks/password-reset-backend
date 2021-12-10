const Joi = require('joi');

const validate = {
    registerUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(16).required(),
    }),
    loginUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(16).required(),
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required(),
    }),
    passwordReset: Joi.object({
        password: Joi.string().min(6).max(16).required(),

    }),
}

module.exports = validate;