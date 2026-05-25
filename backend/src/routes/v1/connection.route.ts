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

/**
 * @swagger
 * /connections:
 *   post:
 *     summary: Create a connection request
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: integer
 *               note:
 *                 type: string
 *             example:
 *               recipientId: 2
 *               note: Let’s connect.
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Connection'
 *       "400":
 *         description: Invalid request
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: List my connections
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Connection'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /connections/{id}:
 *   patch:
 *     summary: Update a connection status
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACCEPTED, REJECTED]
 *             example:
 *               status: ACCEPTED
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Connection'
 *       "400":
 *         description: Invalid connection id or payload
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   delete:
 *     summary: Delete a connection
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection id
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         description: Invalid connection id
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
