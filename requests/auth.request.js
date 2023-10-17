const Joi = require('joi');

function RegisterValidation(body){
    const register = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        role: Joi.string().required(),
    });
    return register.validate(body);
}

function LoginValidation(body){
    const login = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    });
    return login.validate(body);
}

function EmailValidation(body){
    const email = Joi.object({
        email: Joi.string().required().email(),
    });
    return email.validate(body);
}

module.exports.authRequest ={
    RegisterValidation,
    LoginValidation,
    EmailValidation
};