import { Role } from '@prisma/client';
import Joi from 'joi';
import { password } from './custom.validation';

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid(Role.USER, Role.ADMIN)
  })
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      headline: Joi.string().allow('', null),
      bio: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      avatarUrl: Joi.string().uri().allow('', null)
    })
    .min(1)
};

const updateMe = {
  body: Joi.object()
    .keys({
      name: Joi.string(),
      headline: Joi.string().allow('', null),
      bio: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      avatarUrl: Joi.string().uri().allow('', null)
    })
    .min(1)
};

const listPeople = {
  query: Joi.object().keys({
    search: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateMe,
  listPeople,
  deleteUser
};
