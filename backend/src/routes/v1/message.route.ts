import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { messageController } from '../../controllers';
import { messageValidation } from '../../validations';

const router = express.Router();

router
  .route('/')
  .get(auth(), validate(messageValidation.listMessages), messageController.listMessages)
  .post(auth(), validate(messageValidation.sendMessage), messageController.sendMessage);

router
  .route('/:messageId')
  .delete(auth(), validate(messageValidation.deleteMessage), messageController.deleteMessage);

export default router;
