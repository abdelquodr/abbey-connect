import express from 'express';
import auth from '../../middlewares/auth';
import { connectionController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(auth(), connectionController.createConnection)
  .get(auth(), connectionController.listConnections);

router
  .route('/:id')
  .patch(auth(), connectionController.updateConnection)
  .delete(auth(), connectionController.deleteConnection);

export default router;

/**
 * @swagger
 * tags:
 *   name: Connections
 *   description: Manage user connections (requests, accept/reject)
 */
