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

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Read, send, and delete chat messages for accepted connections
 */

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: List messages for a connection
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - connectionId
 *               - content
 *             properties:
 *               connectionId:
 *                 type: integer
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *             example:
 *               connectionId: 1
 *               content: Hello, thanks for connecting.
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Delete one of my messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
