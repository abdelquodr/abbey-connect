import Joi from 'joi';

const listMessages = {
  query: Joi.object().keys({
    connectionId: Joi.number().integer().required()
  })
};

const sendMessage = {
  body: Joi.object().keys({
    connectionId: Joi.number().integer().required(),
    content: Joi.string().trim().min(1).max(5000).required()
  })
};

const deleteMessage = {
  params: Joi.object().keys({
    messageId: Joi.number().integer().required()
  })
};

export default {
  listMessages,
  sendMessage,
  deleteMessage
};
