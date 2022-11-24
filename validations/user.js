/* eslint-disable linebreak-style */
const Joi = require('joi');

module.exports.userValidation = (data) => {
  const schema = Joi.object({
    body: {
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    },
  });

  return schema.validate(data);
};
