import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import connectionService from '../services/connection.service';
import ApiError from '../utils/ApiError';

const createConnection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const requesterId = (req.user as any)!.id;
  const { recipientId, note } = req.body as { recipientId: number; note?: string };

  if (!recipientId || Number.isNaN(Number(recipientId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'recipientId is required');
  }

  const connection = await connectionService.createConnectionRequest(
    requesterId,
    Number(recipientId),
    note
  );
  res.status(httpStatus.CREATED).send(connection);
});

const listConnections = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)!.id;
  const results = await connectionService.listConnectionsForUser(userId);
  res.status(httpStatus.OK).send(results);
});

const updateConnection = catchAsync(async (req: Request, res: Response) => {
  const connectionId = Number(req.params.id);
  const { status } = req.body as { status: string };
  if (!connectionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid connection id');
  }
  const updated = await connectionService.updateConnectionStatus(connectionId, status as any);
  res.status(httpStatus.OK).send(updated);
});

const deleteConnection = catchAsync(async (req: Request, res: Response) => {
  const connectionId = Number(req.params.id);
  if (!connectionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid connection id');
  }
  await connectionService.removeConnection(connectionId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createConnection,
  listConnections,
  updateConnection,
  deleteConnection
};
