import Joi from 'joi';
import { password } from './custom.validation';

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password)
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string()
  })
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string()
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password)
  })
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
};

const resendVerificationEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
};

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
};
