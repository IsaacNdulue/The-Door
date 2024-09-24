const joi = require('joi');

const validation = joi.object({
  firstName: joi.string()
    .required()
    .trim()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      'string.base': 'First name must be a string',
      'string.empty': 'First name cannot be empty',
      'string.min': 'First name must have at least 3 characters',
      'string.max': 'First name must have at most 50 characters',
      'string.pattern.base': 'First name must contain only alphabetic characters'
    }),
  lastName: joi.string()
    .required()
    .trim()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      'string.base': 'Last name must be a string',
      'string.empty': 'Last name cannot be empty',
      'string.min': 'Last name must have at least 3 characters',
      'string.max': 'Last name must have at most 50 characters',
      'string.pattern.base': 'Last name must contain only alphabetic characters'
    }),
  businessName: joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s]*$/, 'letters and spaces only')
    .messages({
      'string.base': 'businessName must be a string',
      'string.empty': 'businessName cannot be empty',
      'string.min': 'businessName must have at least 2 characters',
      'string.max': 'businessName must have at most 50 characters',
      'string.pattern.base': 'businessName must contain letters and spaces only'
    }),
  email: joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .trim()
    .messages({
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required'
    }),
  password: joi.string()
    .min(8)
    .max(20)
    .required()
    .regex(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'Password must contain at least one special character')
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password should have at least 8 characters',
      'string.max': 'Password should have at most 20 characters',
      'string.pattern.base': 'Password must contain at least one special character'
    }),
  // confirmPassword: joi.string()
  //   .valid(joi.ref("password"))
  //   .required()
  //   .messages({
  //     'any.only': 'Confirm password does not match password',
  //     'any.required': 'Confirm password is required'
  //   }),
  phoneNumber: joi.string()
    .required()
    .pattern(/^[0-9]{10,15}$/, 'valid phone number')
    .messages({
      'string.base': 'Phone number must be a string',
      'string.empty': 'Phone number cannot be empty',
      'string.pattern.base': 'Phone number must be a valid phone number with 10 to 15 digits'
    })
});

module.exports = validation;